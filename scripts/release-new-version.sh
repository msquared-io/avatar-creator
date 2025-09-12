#!/bin/bash

# Release New Version Script
# This script tags the current commit with the version from package.json (or an
# explicitly provided version that must match package.json) and publishes
# @msquared/avatar-creator to npm.

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Package paths
PACKAGE_JSON_PATH="packages/avatar-creator/package.json"
PACKAGE_NAME="@msquared/avatar-creator"

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Function to check if package exists on npm
check_npm_version_exists() {
    local package_name=$1
    local version=$2
    
    print_info "Checking if version $version already exists on npm..."
    
    # Check if the specific version exists
    if npm view "$package_name@$version" version >/dev/null 2>&1; then
        return 0  # Version exists
    else
        return 1  # Version doesn't exist
    fi
}

# Main script
main() {
    local input_version=$1

    print_info "Starting release process..."

    # Check if package.json exists
    if [ ! -f "$PACKAGE_JSON_PATH" ]; then
        print_error "Package.json not found at $PACKAGE_JSON_PATH"
    fi

    # Read version from package.json
    local package_version
    package_version=$(node -p "require('./$PACKAGE_JSON_PATH').version")

    # Decide version to release
    local version_to_release
    if [ -n "$input_version" ]; then
        version_to_release="$input_version"
        if [ "$version_to_release" != "$package_version" ]; then
            print_error "Provided version ($version_to_release) does not match package.json version ($package_version). Please update package.json first."
        fi
    else
        version_to_release="$package_version"
    fi

    print_info "Version to release: $version_to_release"

    # Validate version format (basic semver check)
    if ! [[ $version_to_release =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        print_error "Invalid version format. Please use semantic versioning (e.g., 1.0.0)."
    fi

    # Check if version already exists on npm
    if check_npm_version_exists "$PACKAGE_NAME" "$version_to_release"; then
        print_error "Version $version_to_release already exists on npm for package $PACKAGE_NAME."
    fi

    print_success "Version $version_to_release does not exist on npm"

    # Check for build output
    print_info "Checking for build output..."

    BUILD_DIR="packages/avatar-creator/build"
    MAIN_JS="$BUILD_DIR/index.js"
    MAIN_DTS="$BUILD_DIR/index.d.ts"

    if [ ! -d "$BUILD_DIR" ]; then
        print_error "Build directory not found at $BUILD_DIR. Please run 'npm run build' before releasing."
    fi

    if [ ! -f "$MAIN_JS" ]; then
        print_error "Main JavaScript file not found at $MAIN_JS. Please run 'npm run build' before releasing."
    fi

    if [ ! -f "$MAIN_DTS" ]; then
        print_error "TypeScript declaration file not found at $MAIN_DTS. Please run 'npm run build' before releasing."
    fi

    print_success "Build output verified successfully"

    # Create tag for the current commit if it does not already exist
    local tag="v$version_to_release"
    if git rev-parse "$tag" >/dev/null 2>&1; then
        print_warning "Tag $tag already exists locally. Skipping tag creation."
    else
        print_info "Creating tag $tag..."
        git tag -a "$tag" -m "Release version $version_to_release"
        print_success "Created tag $tag"
    fi

    # Push the tag
    print_info "Pushing tag $tag..."
    git push origin "$tag"
    print_success "Pushed tag $tag"

    # Publish to npm (if NODE_AUTH_TOKEN or NPM_TOKEN is set).
    if [ -n "$NODE_AUTH_TOKEN" ] || [ -n "$NPM_TOKEN" ]; then
        print_info "Publishing to npm..."
        cd packages/avatar-creator
        AUTH_TOKEN="${NODE_AUTH_TOKEN:-$NPM_TOKEN}"
        npm publish --registry=https://registry.npmjs.org/ --//registry.npmjs.org/:_authToken="$AUTH_TOKEN" --access public
        cd ../..
        print_success "Published $PACKAGE_NAME@$version_to_release to npm"
    else
        print_warning "NODE_AUTH_TOKEN or NPM_TOKEN not set. Skipping npm publish. Run 'npm publish --access public' manually from packages/avatar-creator/."
    fi

    print_success "🎉 Release process completed successfully!"
    print_info "Version $version_to_release has been:"
    print_info "  • Built and validated."
    print_info "  • Tagged as v$version_to_release."
    if [ -n "$NODE_AUTH_TOKEN" ] || [ -n "$NPM_TOKEN" ]; then
        print_info "  • Published to npm."
    fi
}

# Run main function with all arguments
main "$@"
