#!/usr/bin/env bash

set -euo pipefail

PACKAGE_JSON_PATH="packages/avatar-creator/package.json"

# Determine current version from package.json.
CURRENT_VERSION=$(node -p "require('./${PACKAGE_JSON_PATH}').version")

# Determine previous version from the commit referenced by BEFORE_SHA (if available).
PREVIOUS_VERSION=""
if [ -n "${BEFORE_SHA:-}" ] && git cat-file -e "${BEFORE_SHA}^{commit}" >/dev/null 2>&1; then
  if git show "${BEFORE_SHA}:${PACKAGE_JSON_PATH}" >/dev/null 2>&1; then
    PREVIOUS_VERSION=$(git show "${BEFORE_SHA}:${PACKAGE_JSON_PATH}" | node -e 'let s="";process.stdin.on("data",d=>s+=d);process.stdin.on("end",()=>{try{console.log(JSON.parse(s).version)}catch(e){process.exit(0)}})')
  fi
fi

# Prepare outputs.
SHOULD_RELEASE="false"
MSG="Version unchanged: ${CURRENT_VERSION}"
if [ "${CURRENT_VERSION}" != "${PREVIOUS_VERSION}" ]; then
  SHOULD_RELEASE="true"
  MSG="Version changed: ${PREVIOUS_VERSION} -> ${CURRENT_VERSION}"
fi

# Write to GitHub Actions outputs if available; otherwise print to stdout.
if [ -n "${GITHUB_OUTPUT:-}" ]; then
  {
    echo "current_version=${CURRENT_VERSION}"
    echo "previous_version=${PREVIOUS_VERSION}"
    echo "should_release=${SHOULD_RELEASE}"
    echo "${MSG}"
  } >> "${GITHUB_OUTPUT}"
else
  echo "current_version=${CURRENT_VERSION}"
  echo "previous_version=${PREVIOUS_VERSION}"
  echo "should_release=${SHOULD_RELEASE}"
  echo "${MSG}"
fi


