# Versioning Strategy

## Semantic Versioning (SemVer)

This project follows [Semantic Versioning](https://semver.org/) for version management. The version number is in the format of `MAJOR.MINOR.PATCH`.

### MAJOR version

- **Incremented** for incompatible changes or breaking changes in the API.
- Example: `1.0.0` → `2.0.0`

### MINOR version

- **Incremented** for backward-compatible functionality improvements or new features.
- Example: `1.0.0` → `1.1.0`

### PATCH version

- **Incremented** for backward-compatible bug fixes and minor changes.
- Example: `1.0.0` → `1.0.1`

## Pre-release Versions

- Pre-release versions are indicated by appending a hyphen and an identifier to the version number (e.g., `1.0.0-alpha`, `1.0.0-beta`).
- These versions are used for testing and should not be considered stable.

## Build Metadata

- Build metadata is indicated by appending a plus sign and a string to the version number (e.g., `1.0.0+build5678`).
- This metadata is used for version build tracking and does not affect the version's precedence.

## Example Versioning

- **1.0.0**: Initial stable release with all core features.
- **1.1.0**: Added new features and improvements.
- **1.1.1**: Bug fixes and minor adjustments.
- **2.0.0**: Major update with breaking changes and new architecture.

## Versioning Policy

- **Bug Fixes**: Updates to fix bugs will result in a PATCH increment.
- **New Features**: Addition of new features will result in a MINOR increment.
- **Breaking Changes**: Major changes or updates that break backward compatibility will result in a MAJOR increment.

