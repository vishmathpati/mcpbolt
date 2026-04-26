#!/bin/bash
# Builds MCPBoltBar.app — a standalone macOS menu bar app bundle.
# Usage: bash build-app.sh [release]
set -e

MODE="${1:-debug}"
[ "$MODE" = "release" ] && SWIFT_FLAGS="-c release" || SWIFT_FLAGS=""

echo "→ Building Swift package ($MODE)…"
swift build $SWIFT_FLAGS

if [ "$MODE" = "release" ]; then
    BIN=".build/release/MCPBoltBar"
else
    BIN=".build/debug/MCPBoltBar"
fi

APP="MCPBoltBar.app"
echo "→ Assembling $APP…"

rm -rf "$APP"
mkdir -p "$APP/Contents/MacOS"
mkdir -p "$APP/Contents/Resources"

cp "$BIN" "$APP/Contents/MacOS/MCPBoltBar"

cat > "$APP/Contents/Info.plist" << 'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleIdentifier</key>
    <string>com.mcpbolt.bar</string>
    <key>CFBundleName</key>
    <string>MCPBoltBar</string>
    <key>CFBundleDisplayName</key>
    <string>mcpbolt</string>
    <key>CFBundleVersion</key>
    <string>0.5.17</string>
    <key>CFBundleShortVersionString</key>
    <string>0.5.17</string>
    <key>CFBundleExecutable</key>
    <string>MCPBoltBar</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>LSUIElement</key>
    <true/>
    <key>NSHighResolutionCapable</key>
    <true/>
    <key>LSMinimumSystemVersion</key>
    <string>14.0</string>
    <key>NSHumanReadableCopyright</key>
    <string>MIT</string>
    <key>CFBundleURLTypes</key>
    <array>
        <dict>
            <key>CFBundleURLName</key>
            <string>com.mcpbolt.install</string>
            <key>CFBundleURLSchemes</key>
            <array>
                <string>mcpbolt</string>
            </array>
        </dict>
    </array>
</dict>
</plist>
PLIST

# Ad-hoc code sign so macOS will run it
codesign --force --sign - "$APP/Contents/MacOS/MCPBoltBar"

echo ""
echo "✓ Built: $(pwd)/$APP"
echo ""
echo "To run now:  open $APP"
echo "To install:  cp -r $APP /Applications/"
