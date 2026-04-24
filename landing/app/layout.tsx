import type { Metadata } from "next";
import "./globals.css";
import { SiteNav } from "./components/SiteNav";
import { SiteFooter } from "./components/SiteFooter";

export const metadata: Metadata = {
  metadataBase: new URL("https://mcpbolt.com"),
  title: {
    default: "MCPBolt — One‑click MCP servers for every app",
    template: "%s · MCPBolt",
  },
  description:
    "A tiny menu bar app that installs, syncs, and manages Model Context Protocol servers across Claude Desktop, Cursor, VS Code, Windsurf, Zed, Codex, Gemini, and more. Local, free, open source.",
  openGraph: {
    title: "MCPBolt — One‑click MCP servers for every app",
    description:
      "Install, sync and manage MCP servers across every major AI coding tool from one menu bar app. Local, free, open source.",
    type: "website",
    url: "https://mcpbolt.com",
    siteName: "MCPBolt",
  },
  twitter: {
    card: "summary_large_image",
    title: "MCPBolt — One‑click MCP servers for every app",
    description:
      "Install, sync and manage MCP servers across every major AI coding tool from one menu bar app.",
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SiteNav />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
