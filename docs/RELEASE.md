# Release Guide

This guide explains the automated release process for the `@msquared/avatar-creator` npm package.

## Overview

Releases are automated on pushes to the `main` branch. If the `version` field in
`packages/avatar-creator/package.json` changes compared to the previous commit, CI will:

- Build the package.
- Tag the current commit as `vX.Y.Z` (derived from
  [`package.json`](../packages/avatar-creator/package.json)).
- Publish `@msquared/avatar-creator@X.Y.Z` to npm.

You can still run the release script locally to publish the version currently in `package.json`.

## CI: Automatic Release on Push to main

The workflow at `.github/workflows/main.yaml` runs on every push to `main`. It compares the
previous and current `packages/avatar-creator/package.json` versions. When they differ, it builds
and invokes `scripts/release-new-version.sh` to tag and publish.

### To release via CI

1. Update `packages/avatar-creator/package.json` with the new version.
2. Create a PR with the version update, have it approved and merged to `main`.
3. CI will tag the merge commit and publish to npm automatically.

## Local Usage

You can also run the release script locally to tag and publish the version already present in
`package.json`:

```bash
# Authenticate for npm publish.
export NPM_TOKEN=your_npm_token_here

# Make sure you're on the commit you want to tag and publish.
git checkout main
git pull origin main

# Ensure Git LFS files are available.
git lfs pull

# Build the package.
npm run build --workspace @msquared/avatar-creator || (cd packages/avatar-creator && npm run build)

# Run the release script (reads version from package.json by default).
./scripts/release-new-version.sh
```
