// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "MCPBoltBar",
    platforms: [.macOS(.v14)],
    targets: [
        .executableTarget(
            name: "MCPBoltBar",
            path: "Sources/MCPBoltBar",
            linkerSettings: [.linkedLibrary("sqlite3")]
        ),
    ]
)
