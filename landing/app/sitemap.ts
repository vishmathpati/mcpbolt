import type { MetadataRoute } from "next";
import { POSTS } from "./blog/posts";

const BASE = "https://mcpbolt.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE,                        lastModified: new Date(), changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/features`,          lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/download`,          lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9 },
    { url: `${BASE}/compare`,           lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/changelog`,         lastModified: new Date(), changeFrequency: "weekly",  priority: 0.7 },
    { url: `${BASE}/pricing`,           lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/privacy`,           lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE}/terms`,             lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE}/blog`,              lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE}/docs`,              lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/docs/install`,      lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/docs/quickstart`,   lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/docs/cli`,          lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/docs/config-formats`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/docs/menubar`,      lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/docs/projects`,     lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/docs/health`,       lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/docs/apps`,         lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/docs/troubleshooting`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/docs/faq`,          lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/docs/security`,     lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  const blogPages: MetadataRoute.Sitemap = POSTS.map((post) => ({
    url: `${BASE}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticPages, ...blogPages];
}
