# Dependency license policy

Default policy for a proprietary or commercial product. The repository's own policy file, when present, overrides this one.

## Generally allowed

MIT, BSD-2-Clause, BSD-3-Clause, Apache-2.0, ISC, 0BSD, CC0-1.0, Unlicense, Zlib, Python-2.0, PostgreSQL License.

Notes:

- Apache-2.0 includes a patent grant and is fine for commercial use; keep the NOTICE file when one ships.
- Keep attribution notices in distributions where the license requires it.

## Needs review (weak copyleft)

LGPL-2.1, LGPL-3.0, MPL-2.0, EPL-1.0, EPL-2.0, EUPL-1.2.

- Typically acceptable as a dynamically linked dependency, problematic when statically linked or modified. Flag with "review linking model" and let the user decide.

## Blocked without explicit approval (strong copyleft / restricted)

GPL-2.0, GPL-3.0, AGPL-3.0, SSPL-1.0, Commons Clause, BUSL-1.1 when the use exceeds the grant, CC-BY-NC and CC-BY-SA for code, the JSON.org license, and custom non-commercial clauses.

Actions when a blocked license is found:

1. Report the package, version, license, and where it sits in the dependency tree (direct vs transitive).
2. Suggest a permissively licensed alternative when a well-known one exists.
3. Do not remove or replace the dependency yourself unless the user asked.

## How to check

- Node: `npx license-checker --summary` for an overview and `npx license-checker --json` for per-package details; check transitive dependencies, not just direct ones.
- .NET: for each `PackageReference`, check the license expression on nuget.org or in the package's `.nuspec`.
- Dual-licensed packages (for example `MIT OR Apache-2.0`) pass when at least one option is allowed.
