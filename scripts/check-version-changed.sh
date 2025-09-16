#!/usr/bin/env bash

set -euo pipefail

PACKAGE_JSON_PATH="packages/avatar-creator/package.json"

# Determine current version from package.json.
CURRENT_VERSION=$(node -p "require('./${PACKAGE_JSON_PATH}').version")

# Determine published version from npm registry.
PUBLISHED_VERSION=""
PACKAGE_NAME=$(node -p "require('./${PACKAGE_JSON_PATH}').name")
if PUBLISHED_RAW=$(npm view "${PACKAGE_NAME}" version 2>/dev/null); then
  PUBLISHED_VERSION="${PUBLISHED_RAW}"
fi

# Prepare outputs.
SHOULD_RELEASE="false"
MSG="Version matches npm: ${CURRENT_VERSION}"
if [ -z "${PUBLISHED_VERSION}" ]; then
  SHOULD_RELEASE="true"
  MSG="Package not found on npm. Will release version: ${CURRENT_VERSION}"
elif [ "${CURRENT_VERSION}" != "${PUBLISHED_VERSION}" ]; then
  SHOULD_RELEASE="true"
  MSG="Version differs from npm: npm=${PUBLISHED_VERSION} local=${CURRENT_VERSION}"
fi

# Write to GitHub Actions outputs if available; otherwise print to stdout.
if [ -n "${GITHUB_OUTPUT:-}" ]; then
  {
    echo "current_version=${CURRENT_VERSION}"
    echo "published_version=${PUBLISHED_VERSION}"
    echo "previous_version=${PUBLISHED_VERSION}"
    echo "should_release=${SHOULD_RELEASE}"
    echo "message=${MSG}"
  } >> "${GITHUB_OUTPUT}"
else
  echo "current_version=${CURRENT_VERSION}"
  echo "published_version=${PUBLISHED_VERSION}"
  echo "previous_version=${PUBLISHED_VERSION}"
  echo "should_release=${SHOULD_RELEASE}"
  echo "${MSG}"
fi
