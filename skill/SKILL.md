---
name: secret-scan
description: Use before pushing or committing to scan the working tree for credentials (keys, tokens, connection strings, private key blocks) and license-incompatible dependencies, then remediate.
---

# Secret Scan

Pre-push review that keeps credentials and license conflicts out of the repository.

## When to use / When not to use

Use this skill when:

- The user is about to commit or push, or asks for a security pass over the working tree.
- A PR adds config files, `.env` samples, test fixtures, or new dependencies.

Do not use this skill when:

- The user asks for a full application security review (threat model, authorization, injection). This skill covers committed secrets and dependency licenses only.

## Inputs

- The change set: `git status --porcelain` plus `git diff --staged`, including untracked files about to be added.
- The pattern catalog: [secret-patterns.md](secret-patterns.md).
- The license policy: [license-policy.md](license-policy.md).
- The dependency manifests: `package.json` and lockfile, or `*.csproj` and `packages.lock.json`.

## Procedure

1. Enumerate what would leave the machine: staged changes, tracked modifications, and untracked files not covered by `.gitignore`. Pay special attention to `.env*`, `appsettings*.json`, `*.config`, `*.pem`, `*.key`, and test fixtures.
2. Run the pattern scan with ripgrep over those files, using the catalog in [secret-patterns.md](secret-patterns.md):

   ```
   rg -n --no-heading -i '(api[_-]?key|secret|password|token)\s*[:=]\s*"[^"]{8,}"' .
   rg -n 'BEGIN [A-Z ]*PRIVATE KEY' .
   rg -n 'AKIA[0-9A-Z]{16}|gh[psour]_[A-Za-z0-9]{20,}|xox[baprs]-[A-Za-z0-9-]+' .
   rg -n '(mongodb(\+srv)?|postgres(ql)?|mysql|amqp|redis)://[^/\s:]+:[^@\s]+@' .
   ```

   Scan both the added lines in diffs and whole untracked files.
3. Classify each hit before reporting:
   - True positive: real-looking entropy, a private key block, a live connection string with credentials.
   - Placeholder: `<your-token>` style placeholders, `${VAR}` / `process.env.*` / `Configuration["..."]` references, vendor-documented example values marked EXAMPLE. Keep these; they are not findings.
4. Report findings without reproducing the secret: file, line, pattern name, and only the first 4 characters plus the length, for example `ghp_**** (40 chars)`. Never paste a full value into chat, commit messages, or logs.
5. Remediate each finding, in order:
   1. Move the value to an environment variable, user-secrets, or the platform secret store, and replace the literal with a reference.
   2. Put a documented placeholder (`<your-token>`) in the sample file so setup stays discoverable.
   3. Tell the user to rotate or revoke the credential: a secret that reached a file that was, or may have been, committed is compromised even after the file is deleted.
   4. If it already reached git history, point the user to history rewriting (`git filter-repo` or the platform's secret-removal flow) and note that force-pushing shared branches needs team coordination. Do not run history rewriting yourself.
6. Scan dependency licenses:
   - Node: `npm ls --all` for the tree, `npx license-checker --summary` for licenses; check transitive dependencies, not only direct ones.
   - .NET: read each `PackageReference` and check the license expression on nuget.org or in the package's `.nuspec`.
   - Compare against [license-policy.md](license-policy.md): flag strong copyleft (GPL, AGPL, SSPL) and non-commercial clauses for a proprietary product; mark weak copyleft (LGPL, MPL) as "review linking model".
7. End with a verdict: clear to push, or blocked with the list of required actions.

## Output format

```markdown
## Pre-push scan

### Secrets
| File:line | Pattern | Value hint | Action |
|-----------|---------|------------|--------|
| config/appsettings.json:12 | connection string with password | `Server=...****` | move to user-secrets, rotate the DB password |

### Licenses
| Package | Version | License | Verdict |
|---------|---------|---------|---------|
| some-lib | 1.4.0 | AGPL-3.0 | blocked for proprietary use - pick an alternative or get sign-off |

Verdict: <clear to push | blocked: N actions required>
```

## Guardrails

- Never print, commit, or otherwise expose a discovered secret value; redact everything beyond the identifying prefix.
- Block the push on any true positive: report and remediate first, push second.
- Do not rewrite git history or delete remote branches yourself; give the user the exact steps instead.
- Keep placeholders in sample files in the documented `<your-...>` style so scanners, including this skill, recognize them as safe.
- License findings are advisory unless the repo has a written policy; when in doubt, surface the conflict and let the user decide.
- Workspace rules and the repository's own security policy take precedence over this skill's defaults.
