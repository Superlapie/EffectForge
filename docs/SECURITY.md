# Security

## Input validation

All project input is validated with Zod before use. Imported `.effectforge` archives are treated as hostile.

## Archive safety (Phase 8)

- Reject path traversal (`../`, absolute paths)
- Limit entry count and decompressed size
- Validate MIME signatures for assets

## MCP path security (Phase 20)

Filesystem operations are confined to explicit workspace roots. Paths are canonicalized and containment-checked.

## No arbitrary execution

- No `eval` or project-embedded executable JavaScript
- No arbitrary shell strings through MCP
- Custom application events use structured names, not code

## CSP

The web application will use Content Security Policy where practical (Phase 27).
