"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const DOC_SECTIONS: Array<{ title: string; items: Array<{ label: string; href: string }> }> = [
  {
    title: "Getting started",
    items: [
      { label: "Introduction", href: "/docs" },
      { label: "Install", href: "/docs/install" },
      { label: "Quickstart", href: "/docs/quickstart" },
    ],
  },
  {
    title: "MCP server types",
    items: [
      { label: "Local (stdio) servers", href: "/docs/install-local" },
      { label: "Streamable HTTP servers", href: "/docs/install-streamable" },
    ],
  },
  {
    title: "CLI",
    items: [
      { label: "CLI reference", href: "/docs/cli" },
      { label: "Config formats", href: "/docs/config-formats" },
    ],
  },
  {
    title: "Menu bar app",
    items: [
      { label: "Tour", href: "/docs/menubar" },
      { label: "Projects tab", href: "/docs/projects" },
      { label: "Health status", href: "/docs/health" },
    ],
  },
  {
    title: "Reference",
    items: [
      { label: "Supported apps", href: "/docs/apps" },
      { label: "Troubleshooting", href: "/docs/troubleshooting" },
      { label: "FAQ", href: "/docs/faq" },
      { label: "Security", href: "/docs/security" },
    ],
  },
];

export function DocsSidebar() {
  const pathname = usePathname();
  return (
    <aside className="docs-sidebar">
      {DOC_SECTIONS.map((group) => (
        <div key={group.title} className="docs-sidebar-group">
          <div className="docs-sidebar-title">{group.title}</div>
          {group.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={pathname === item.href ? "active" : ""}
            >
              {item.label}
            </Link>
          ))}
        </div>
      ))}
    </aside>
  );
}
