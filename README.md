# Secret Scan

A Camillia skill that reviews the working tree before a push: it finds credentials (API keys, tokens, connection strings, private key blocks) and license-incompatible dependencies, then walks through remediation.

## What the agent gains

- A ripgrep pattern catalog for provider token formats, private key blocks, connection strings, and generic secret assignments
- Placeholder allowlisting so `<your-token>` style samples are not flagged
- Redacted reporting: findings show file, line, and a prefix hint, never the secret itself
- A dependency license policy with allowed / review / blocked tiers and concrete remediation steps

## Install

Install from the Camillia Community Hub. After installation the skill lives in the workspace under `.workspace/skills/skill-secret-scan/` and the agent applies it before commits and pushes.

## Contents

- `skill/SKILL.md` - the procedure the agent follows
- `skill/secret-patterns.md` - the detection pattern catalog
- `skill/license-policy.md` - the dependency license tiers

## Validate

```
node scripts/validate.mjs
```

## License

MIT - see [LICENSE](LICENSE). Copyright 2026 Camillia contributors.
