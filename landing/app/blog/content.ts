import type { ComponentType } from "react";
import { McpConfigHell } from "./content/mcp-config-hell";
import { IntroducingMcpbolt } from "./content/introducing-mcpbolt";
import { WhatIsMcp } from "./content/what-is-mcp";
import { TopMcpServers2026 } from "./content/top-mcp-servers-2026";
import { McpToolComparison } from "./content/mcp-tool-comparison";
import { LocalFirstWhyItMatters } from "./content/local-first-why-it-matters";
import { McpMarketLandscape } from "./content/mcp-market-landscape";
import { McpWindowsGuide } from "./content/mcp-windows-guide";
import { McpSecurityRedFlags } from "./content/mcp-security-red-flags";

export const POST_CONTENT: Record<string, ComponentType> = {
  "mcp-config-hell": McpConfigHell,
  "introducing-mcpbolt": IntroducingMcpbolt,
  "what-is-mcp": WhatIsMcp,
  "top-mcp-servers-2026": TopMcpServers2026,
  "mcp-tool-comparison": McpToolComparison,
  "local-first-why-it-matters": LocalFirstWhyItMatters,
  "mcp-market-landscape": McpMarketLandscape,
  "mcp-windows-guide": McpWindowsGuide,
  "mcp-security-red-flags": McpSecurityRedFlags,
};
