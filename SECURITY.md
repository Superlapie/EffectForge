# Security Policy

## Reporting vulnerabilities

If you discover a security vulnerability in EffectForge, please report it responsibly. Do not open public issues for security-sensitive findings until they have been addressed.

## Security practices

- All project input validated with Zod
- Archive import treated as hostile (Phase 8)
- MCP path containment (Phase 20)
- No `eval` or arbitrary script execution from project files
- Automated dependency license audit in CI

See [docs/SECURITY.md](./docs/SECURITY.md) for technical details.
