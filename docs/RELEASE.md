# Release Guide

This guide explains the automated release process for the `@msquared/avatar-creator` npm package.

## Overview

Releases are automated on pushes to the `main` branch. If the `version` field in
`packages/avatar-creator/package.json` changes compared to the previous commit, CI will:

- Build the package.
- Tag the current commit as `vX.Y.Z` (derived from `package.json`).
- Publish `@msquared/avatar-creator@X.Y.Z` to npm.

You can still run the release script locally to publish the version currently in `package.json`.

## CI: Automatic Release on Push to main

The workflow at `.github/workflows/release.yaml` runs on every push to `main`. It compares the
previous and current `packages/avatar-creator/package.json` versions. When they differ, it builds
and invokes `scripts/release-new-version.sh` to tag and publish.

### To cut a new release via CI

1. Update `packages/avatar-creator/package.json` with the new version.
2. Commit and merge to `main` (via PR).
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

Optionally, you can pass an explicit version, but it must match `package.json`:

```bash
./scripts/release-new-version.sh X.Y.Z
```

## Notes

- The script checks that the version does not already exist on npm.
- The script tags the current commit as `vX.Y.Z` and pushes that tag.
- No files are modified by the script; you are responsible for bumping the version in `package.json`
  before releasing.

## Troubleshooting

### Error: "Version already exists on npm"

- Check existing versions: `npm view @msquared/avatar-creator versions --json`.
- Use a different version number and update `package.json`.

### Error: "Permission denied to push"

- Verify `GITHUB_TOKEN` has `contents: write` permission in CI.
- Check if branch protection rules are blocking the push.

### Error: "NPM publish failed"

- Verify `NPM_TOKEN` is correctly set in GitHub Secrets (CI) or your shell (local).
- Ensure the token has publish permissions for the `@msquared` scope.
- Ensure you're a maintainer/owner of the npm package.
