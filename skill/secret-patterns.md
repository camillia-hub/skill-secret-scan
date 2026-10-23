# Secret pattern catalog

Run these with ripgrep over staged and untracked files. Exclude binary assets with `--glob` filters as needed.

## Provider formats (high confidence)

| Name | Pattern | Safe placeholder form |
|------|---------|----------------------|
| AWS access key id | `AKIA[0-9A-Z]{16}` | `<your-aws-access-key-id>` |
| GitHub tokens | `gh[psour]_[A-Za-z0-9]{20,}` | `<your-github-token>` |
| Slack tokens | `xox[baprs]-[A-Za-z0-9-]{10,}` | `<your-slack-token>` |
| Stripe keys | `[sr]k_(live|test)_[A-Za-z0-9]{16,}` | `<your-stripe-key>` |
| OpenAI-style keys | `sk-[A-Za-z0-9_-]{20,}` | `<your-api-key>` |
| Google API key | `AIza[0-9A-Za-z_-]{35}` | `<your-google-api-key>` |
| JWT | `eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}` | `<your-jwt>` |

## Structural patterns

- Private key blocks: `BEGIN (RSA |EC |OPENSSH |DSA )?PRIVATE KEY` - the whole block is sensitive, including inside test fixtures.
- Connection strings with credentials: `(Server|Data Source)=.*;(Password|Pwd)=` and URI forms `(mongodb(\+srv)?|postgres(ql)?|mysql|amqp|redis)://[^/\s:]+:[^@\s]+@`.
- Generic assignments, case-insensitive: `(api[_-]?key|apikey|secret|client[_-]?secret|password|passwd|access[_-]?token|refresh[_-]?token|private[_-]?key)\s*[:=]\s*"[^"]{8,}"`.

## Allowlisted placeholders (do not report)

- `<your-token>`, `<your-password>`, `<your-api-key>` and other `<...>` placeholders
- `${VAR}`, `%VAR%`, `process.env.NAME`, `Configuration["Name"]`, and user-secrets references
- Vendor-documented example values that include the word EXAMPLE
- Empty strings and obvious test literals shorter than 8 characters

## Triage hints

- Entropy matters: a repeated character run or `12345678` is a placeholder; mixed-case alphanumeric runs of 20 or more characters usually are not.
- Check the file's purpose: fixtures under `test/` with documented dummy values are lower risk than `appsettings.Production.json`.
- When unsure, treat the hit as a true positive: report it with a redacted hint and let the user decide.
