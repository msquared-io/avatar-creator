# Release Guide

This guide explains how to set up the automated release process for the `@msquared/avatar-creator`
npm package.

## Overview

The release process consists of:

1. **GitHub Action** (`.github/workflows/release.yml`) - Automated workflow triggered manually
2. **Release Script** (`scripts/release-new-version.sh`) - Can be run locally or in CI

## Features

✅ **Manual Trigger**: GitHub Action can be triggered manually with version input  
✅ **Version Validation**: Ensures no unexpected version jumps (max +1 per part)  
✅ **Semantic Versioning**: Enforces proper semver format and rules  
✅ **NPM Existence Check**: Prevents publishing duplicate versions  
✅ **Git Tagging**: Automatically creates and pushes version tags  
✅ **Local & CI Support**: Script works both locally and in GitHub Actions

## Usage

### GitHub Action (Recommended)

1. Go to your repository → Actions → "Release New Version"
2. Click "Run workflow"
3. Enter the new version number (e.g., `0.1.6`, `0.2.0`, `1.0.0`)
4. Click "Run workflow"

The action will:

- Validate the version number
- Check npm for existing versions
- Build the package
- Update package.json
- Create a commit and tag
- Push to main branch
- Publish to npm

### Local Usage

You can also run the release script locally:

```bash
# Set your NPM_TOKEN for authenticating whilst publishing
export NPM_TOKEN=your_npm_token_here

# Make sure you're on the main branch and up to date
git checkout main
git pull origin main

# Ensure Git LFS files are available
git lfs pull

# Build the package
npm run build

# Run the release script - replacing X.Y.Z with your desired version number
./scripts/release-new-version.sh X.Y.Z
```

## Version Validation Rules

The script enforces these rules:

### ✅ Valid Version Bumps

- `0.1.5` → `0.1.6` (patch bump)
- `0.1.5` → `0.2.0` (minor bump, patch resets to 0)
- `0.1.5` → `1.0.0` (major bump, minor and patch reset to 0)

### ❌ Invalid Version Bumps

- `0.1.5` → `0.1.4` (downgrade)
- `0.1.5` → `0.1.5` (same version)
- `0.1.5` → `0.1.7` (patch jumps by 2)
- `0.1.5` → `0.3.0` (minor jumps by 2)
- `0.1.5` → `1.0.1` (major bump but patch not reset to 0)
- `0.1.5` → `1.1.0` (major bump but minor not reset to 0)

## Troubleshooting

### Error: "Version already exists on npm"

- Check what versions exist: `npm view @msquared/avatar-creator versions --json`
- Use a different version number

### Error: "Permission denied to push"

- Verify `GITHUB_TOKEN` has `contents: write` permission
- Check if branch protection rules are blocking the push

### Error: "NPM publish failed"

- Verify `NPM_TOKEN` is correctly set in GitHub Secrets
- Check token has write permissions for `@msquared` scope
- Ensure you're a maintainer/owner of the npm package

### Error: "Invalid version jump"

- Follow semantic versioning rules (see above)
- Only increment version parts by 1
- Reset lower parts to 0 when higher parts increase
