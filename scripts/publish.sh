#!/bin/bash
# Publish each package manually via Bun, so that all "workspace:*" and "catalog:" versions
# in the corresponding package.json file are resolved to their real versioning on the root.
for dir in packages/*; do
  if [ "$dir" = "packages/demo" ]; then
    continue
  fi
  (cd "$dir" && bun publish || true)
done
changeset tag
