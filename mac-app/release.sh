#!/bin/bash
# One-command release: bump version, build, push, GitHub release, update cask.
#
# Usage: bash release.sh <version> "Release notes"
# Example: bash release.sh 0.5.21 "Fix crash on startup"

set -e

VERSION="$1"
NOTES="$2"

if [ -z "$VERSION" ]; then
    echo "Usage: bash release.sh <version> \"Release notes\""
    exit 1
fi

cd "$(dirname "$0")"
REPO_ROOT="$(cd .. && pwd)"

echo "→ Bumping version to $VERSION…"
sed -i '' "s/<string>[0-9]*\.[0-9]*\.[0-9]*<\/string>/<string>$VERSION<\/string>/g" build-app.sh

echo "→ Building release…"
bash package.sh

SHA=$(shasum -a 256 MCPBoltBar.zip | awk '{print $1}')
echo "→ SHA256: $SHA"

echo "→ Committing version bump…"
cd "$REPO_ROOT"
git add mac-app/build-app.sh
git commit -m "chore: bump version to $VERSION"
git push

echo "→ Creating GitHub release mac-v$VERSION…"
gh release create "mac-v$VERSION" mac-app/MCPBoltBar.zip \
    --title "v$VERSION" \
    --notes "${NOTES:-Release $VERSION}"

echo "→ Updating Homebrew cask…"
CASK_SHA=$(gh api repos/vishmathpati/homebrew-mcpbolt/contents/Casks/mcpboltbar.rb --jq '.sha')

CASK_CONTENT=$(cat <<CASK
cask "mcpboltbar" do
  version "$VERSION"
  sha256 "$SHA"

  url "https://github.com/vishmathpati/mcpbolt/releases/download/mac-v\#{version}/MCPBoltBar.zip"
  name "MCPBoltBar"
  desc "Menu bar app for managing MCP servers across AI coding tools"
  homepage "https://github.com/vishmathpati/mcpbolt"

  livecheck do
    url :url
    strategy :github_latest
    regex(/^mac-v(\d+(?:\.\d+)+)$/i)
  end

  auto_updates false
  depends_on macos: ">= :sonoma"

  app "MCPBoltBar.app"

  # App is ad-hoc signed (not notarized). Strip the quarantine flag on install
  # so Gatekeeper doesn't block first launch.
  postflight do
    system_command "/usr/bin/xattr",
                   args: ["-cr", "\#{appdir}/MCPBoltBar.app"],
                   sudo: false
  end

  zap trash: [
    "~/Library/Preferences/com.mcpbolt.MCPBoltBar.plist",
    "~/Library/Saved Application State/com.mcpbolt.MCPBoltBar.savedState",
  ]

  caveats <<~EOS
    MCPBoltBar lives in your menu bar (⚡ icon). Click it to see your MCP servers.

    The app is ad-hoc signed (not notarized by Apple). This installer strips
    the quarantine flag automatically. If macOS still complains:

      xattr -cr /Applications/MCPBoltBar.app

  EOS
end
CASK
)

ENCODED=$(echo "$CASK_CONTENT" | base64)

gh api --method PUT repos/vishmathpati/homebrew-mcpbolt/contents/Casks/mcpboltbar.rb \
    --field message="chore: bump cask to $VERSION" \
    --field content="$ENCODED" \
    --field sha="$CASK_SHA" \
    --jq '.commit.html_url'

echo ""
echo "✓ Released v$VERSION"
echo "  GitHub:  https://github.com/vishmathpati/mcpbolt/releases/tag/mac-v$VERSION"
echo "  Install: brew install --cask vishmathpati/mcpbolt/mcpboltbar"
echo "  Upgrade: brew upgrade --cask mcpboltbar"
