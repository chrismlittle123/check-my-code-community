#!/bin/bash

# Pulls the latest compatibility.yaml from the check-my-code repo
# Usage: ./scripts/pull-compatibility.sh

set -e

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
COMPAT_URL="https://raw.githubusercontent.com/chrismlittle123/check-my-code/main/src/config/compatibility.yaml"
OUTPUT_FILE="$REPO_ROOT/compatibility.yaml"

echo "Pulling compatibility.yaml from check-my-code repo..."
curl -fsSL "$COMPAT_URL" -o "$OUTPUT_FILE"

echo "✓ Downloaded to $OUTPUT_FILE"
