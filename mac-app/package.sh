#!/bin/bash
# Builds MCPBoltBar.app in release mode and zips it into MCPBoltBar.zip
# ready to share (AirDrop, email, Dropbox, etc.)
#
# Usage: bash package.sh

set -e

cd "$(dirname "$0")"

echo "→ Building release…"
bash build-app.sh release > /dev/null

echo "→ Zipping app (preserves resource forks, code signatures, symlinks)…"
rm -f MCPBoltBar.zip
ditto -c -k --keepParent MCPBoltBar.app MCPBoltBar.zip

SIZE=$(du -h MCPBoltBar.zip | cut -f1)

echo ""
echo "✓ Built: $(pwd)/MCPBoltBar.zip ($SIZE)"
echo ""
echo "Share it with a friend — AirDrop, email, Dropbox, whatever."
echo ""
echo "Their install steps:"
echo "  1. Unzip (double-click)"
echo "  2. Drag MCPBoltBar.app to /Applications"
echo "  3. First launch: right-click → Open → Open (Gatekeeper bypass)"
echo "     OR run: xattr -cr /Applications/MCPBoltBar.app"
echo ""
