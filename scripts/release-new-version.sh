#!/bin/bash

# Release New Version Script
# This script handles version validation and publishing for @msquared/avatar-creator

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

# Function to compare version numbers
version_compare() {
    local version1=$1
    local version2=$2
    
    # Split versions into arrays
    IFS='.' read -ra V1 <<< "$version1"
    IFS='.' read -ra V2 <<< "$version2"
    
    # Compare major, minor, patch
    for i in {0..2}; do
        local v1_part=${V1[$i]:-0}
        local v2_part=${V2[$i]:-0}
        
        if [ "$v1_part" -gt "$v2_part" ]; then
            echo "greater"
            return
        elif [ "$v1_part" -lt "$v2_part" ]; then
            echo "less"
            return
        fi
    done
    
    echo "equal"
}

# Function to validate version jump
validate_version_jump() {
    local current_version=$1
    local new_version=$2
    
    # Split versions into arrays
    IFS='.' read -ra CURRENT <<< "$current_version"
    IFS='.' read -ra NEW <<< "$new_version"
    
    local major_current=${CURRENT[0]:-0}
    local minor_current=${CURRENT[1]:-0}
    local patch_current=${CURRENT[2]:-0}
    
    local major_new=${NEW[0]:-0}
    local minor_new=${NEW[1]:-0}
    local patch_new=${NEW[2]:-0}
    
    # Check if any part increases by more than 1
    local major_diff=$((major_new - major_current))
    local minor_diff=$((minor_new - minor_current))
    local patch_diff=$((patch_new - patch_current))
    
    if [ $major_diff -gt 1 ] || [ $minor_diff -gt 1 ] || [ $patch_diff -gt 1 ]; then
        return 1
    fi
    
    # If major version increases, minor and patch should reset to 0
    if [ $major_diff -gt 0 ]; then
        if [ $minor_new -ne 0 ] || [ $patch_new -ne 0 ]; then
            return 1
        fi
    fi
    
    # If minor version increases, patch should reset to 0
    if [ $minor_diff -gt 0 ] && [ $major_diff -eq 0 ]; then
        if [ $patch_new -ne 0 ]; then
            return 1
        fi
    fi
    
    return 0
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
    local new_version=$1
    
    if [ -z "$new_version" ]; then
        print_error "Version number is required. Usage: $0 <version>"
    fi
    
    print_info "Starting release process for version $new_version..."
    
    # Check if package.json exists
    if [ ! -f "$PACKAGE_JSON_PATH" ]; then
        print_error "Package.json not found at $PACKAGE_JSON_PATH"
    fi
    
    # Get current version from package.json
    local current_version
    current_version=$(node -p "require('./$PACKAGE_JSON_PATH').version")
    
    print_info "Current version: $current_version"
    print_info "New version: $new_version"
    
    # Validate version format (basic semver check)
    if ! [[ $new_version =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        print_error "Invalid version format. Please use semantic versioning (e.g., 1.0.0)"
    fi
    
    # Check if new version is greater than current version
    local comparison
    comparison=$(version_compare "$new_version" "$current_version")
    
    if [ "$comparison" = "less" ] || [ "$comparison" = "equal" ]; then
        print_error "New version ($new_version) must be greater than current version ($current_version)"
    fi
    
    # Validate version jump
    if ! validate_version_jump "$current_version" "$new_version"; then
        print_error "Invalid version jump from $current_version to $new_version. Version parts can only increase by 1, and when a higher-order part increases, lower parts should reset to 0."
    fi
    
    print_success "Version jump validation passed"
    
    # Check if version already exists on npm
    if check_npm_version_exists "$PACKAGE_NAME" "$new_version"; then
        print_error "Version $new_version already exists on npm for package $PACKAGE_NAME"
    fi
    
    print_success "Version $new_version does not exist on npm"
    
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
    
    # Update package.json version
    print_info "Updating package.json version..."
    node -e "
        const fs = require('fs');
        const path = '$PACKAGE_JSON_PATH';
        const pkg = JSON.parse(fs.readFileSync(path, 'utf8'));
        pkg.version = '$new_version';
        fs.writeFileSync(path, JSON.stringify(pkg, null, 2) + '\n');
    "
    
    print_success "Updated $PACKAGE_JSON_PATH to version $new_version"
    
    # Add and commit changes
    print_info "Creating commit..."
    git add "$PACKAGE_JSON_PATH"
    git commit -m "chore: release version $new_version"
    
    print_success "Created commit for version $new_version"
    
    # Create and push tag
    print_info "Creating tag v$new_version..."
    git tag -a "v$new_version" -m "Release version $new_version"
    
    print_success "Created tag v$new_version"
    
    # Publish to npm if NPM_TOKEN is set
    if [ -n "$NPM_TOKEN" ]; then
        print_info "Publishing to npm..."
        cd packages/avatar-creator
        npm publish --access public
        cd ../..
        print_success "Published $PACKAGE_NAME@$new_version to npm"
    else
        print_warning "NPM_TOKEN not set. Skipping npm publish. Run 'npm publish --access public' manually from packages/avatar-creator/"
    fi
    
    print_success "🎉 Release process completed successfully!"
    print_info "Version $new_version has been:"
    print_info "  • Built and validated"
    print_info "  • Committed to git"
    print_info "  • Tagged as v$new_version"
    if [ -n "$NODE_AUTH_TOKEN" ] || [ -n "$NPM_TOKEN" ]; then
        print_info "  • Published to npm"
    fi
    print_info ""
    print_info "Next steps:"
    print_info "  • Push changes: git push origin main"
    print_info "  • Push tags: git push --tags"
}

# Run main function with all arguments
main "$@"
