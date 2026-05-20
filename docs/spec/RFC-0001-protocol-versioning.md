# RFC-0001: Protocol Versioning

## Status

Accepted

## Summary

RepoGraph uses semantic versioning for the protocol specification, independent of the CLI tool version.

## Version Format

`MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes to file formats or required fields
- **MINOR**: Additive changes (new optional fields, new file types)
- **PATCH**: Documentation and schema clarifications only

## Current Version

`0.1.0` — Initial protocol release

## Compatibility Rules

1. CLI tools MUST declare supported protocol versions in `project.yml`
2. CLI tools SHOULD accept the current minor version and all patch versions
3. Breaking changes require a major version bump and migration guide
4. Generated output (`graph.json`) includes a `version` field matching the protocol

## Migration Process

1. Propose change via GitHub issue with `protocol-change` label
2. Update JSON schemas in `packages/protocol/src/schemas/`
3. Update `docs/spec/` documentation
4. Provide migration notes for existing `.repograph/` directories
5. Bump protocol version in templates and examples

## Deprecation

- Deprecated fields MUST be supported for at least one minor version
- Deprecated fields SHOULD log warnings when used
- Removal requires a major version bump
