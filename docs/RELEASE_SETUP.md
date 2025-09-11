# Release Setup Guide

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

## Prerequisites

### 1. Git LFS Setup

This project uses Git LFS for large assets (.glb, .webp files) that are embedded in the built
package. The release process automatically pulls these files, but you need Git LFS installed:

**GitHub Actions**: Already configured with `lfs: true` in checkout and automatic `git lfs pull`

**Local Development**:

```bash
# Install Git LFS (if not already installed)
# On macOS with Homebrew:
brew install git-lfs

# Initialize and pull LFS files
git lfs install
git lfs pull
```

⚠️ **Critical**: Without Git LFS files, the build will embed LFS pointer files instead of actual
assets, resulting in broken 3D models and images.

### 2. NPM Token Setup

You need to create an NPM access token and add it to GitHub Secrets:

1. **Generate NPM Token**:

   ```bash
   npm login  # Login to your npm account
   npm token create --type=granular --scope=@msquared
   ```

   Or use the NPM web interface:

   - Go to [npmjs.com](https://www.npmjs.com) → Account → Access Tokens
   - Click "Generate New Token"
   - Select "Granular Access Token"
   - Set scope to `@msquared` organization
   - Set permissions to "Read and write"

2. **Add to GitHub Secrets**:
   - Go to your repository → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: Your NPM token (starts with `npm_`)

### 3. Repository Permissions

The GitHub Action needs permissions to:

- Push commits and tags to the repository
- Publish to npm

**Option A: Use Fine-grained Personal Access Token (Recommended)**

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens
2. Generate new token with these permissions for your repository:
   - Contents: Read and write
   - Metadata: Read
   - Pull requests: Write
3. Add token as `GITHUB_TOKEN` secret (or use the default `GITHUB_TOKEN`)

**Option B: Use Default GITHUB_TOKEN (Simpler)**

The workflow uses the default `GITHUB_TOKEN` with these permissions:

```yaml
permissions:
  contents: write
  packages: write
  pull-requests: write
```

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
# Make sure you're on the main branch and up to date
git checkout main
git pull origin main

# Ensure Git LFS files are available
git lfs pull

# Run the release script
./scripts/release-new-version.sh 0.1.6
```

**Note**: For local usage, set `NPM_TOKEN` environment variable:

```bash
export NPM_TOKEN=your_npm_token_here
./scripts/release-new-version.sh 0.1.6
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

### Script Permission Issues (Local)

```bash
chmod +x scripts/release-new-version.sh
```

## Manual Steps (Backup Plan)

If the automated process fails, you can release manually:

```bash
# 1. Update version in package.json manually
cd packages/avatar-creator
npm version patch  # or minor, major

# 2. Build and publish
npm run build
npm publish --access public

# 3. Commit and tag
git add .
git commit -m "chore: release version 0.1.6"
git tag v0.1.6
git push origin main
git push --tags
```

## Security Notes

- Never commit npm tokens to the repository
- Use fine-grained tokens with minimal required permissions
- Regularly rotate npm tokens
- Monitor npm package downloads and versions for any unauthorized releases
