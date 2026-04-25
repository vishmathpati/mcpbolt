import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { SiteNav } from "./components/SiteNav";
import { SiteFooter } from "./components/SiteFooter";

const GA_ID = "G-GJK1E9W9L7";

export const metadata: Metadata = {
  metadataBase: new URL("https://mcpbolt.app"),
  title: {
    default: "MCPBolt — One‑click MCP servers for every app",
    template: "%s · MCPBolt",
  },
  description:
    "A tiny Mac menu bar app that installs, syncs, and manages Model Context Protocol servers across Claude Desktop, Cursor, VS Code, Windsurf, Zed, Codex CLI, Gemini CLI, and more. Local, free, open source.",
  openGraph: {
    title: "MCPBolt — One‑click MCP servers for every app",
    description:
      "Install, sync, and manage MCP servers across every major AI coding tool from one menu bar app. Local, free, open source.",
    type: "website",
    url: "https://mcpbolt.app",
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
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}</Script>
        <SiteNav />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
