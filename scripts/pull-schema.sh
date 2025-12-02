#!/bin/bash

# Pulls the latest schema.json from the check-my-code repo
# Usage: ./scripts/pull-schema.sh

set -e

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SCHEMA_URL="https://raw.githubusercontent.com/chrismlittle123/check-my-code/main/schema.json"
OUTPUT_FILE="$REPO_ROOT/schema.json"

echo "Pulling schema.json from check-my-code repo..."
curl -fsSL "$SCHEMA_URL" -o "$OUTPUT_FILE"

echo "✓ Downloaded to $OUTPUT_FILE"
