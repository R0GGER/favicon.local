import * as cheerio from "cheerio";
import { resolveUrl } from "./utils.js";

export interface FaviconCandidate {
  href: string;
  type?: string;
  sizes?: string;
  source: "link-icon" | "apple-touch-icon" | "manifest" | "fallback" | "google" | "meta-image";
  width?: number;
  height?: number;
}

function parseSizes(sizes?: string): { width: number; height: number } | null {
  if (!sizes || sizes === "any") return null;
  const match = sizes.match(/(\d+)x(\d+)/i);
  if (!match) return null;
  return { width: parseInt(match[1], 10), height: parseInt(match[2], 10) };
}

export function parseHTML(html: string, baseUrl: string): FaviconCandidate[] {
  const $ = cheerio.load(html);
  const candidates: FaviconCandidate[] = [];

  // <link rel="icon"> and <link rel="shortcut icon">
  $('link[rel="icon"], link[rel="shortcut icon"]').each((_, el) => {
    const href = resolveUrl(baseUrl, $(el).attr("href") || "");
    if (!href) return;
    const sizes = parseSizes($(el).attr("sizes") || undefined);
    candidates.push({
      href,
      type: $(el).attr("type") || undefined,
      sizes: $(el).attr("sizes") || undefined,
      source: "link-icon",
      ...(sizes && { width: sizes.width, height: sizes.height }),
    });
  });

  // <link rel="apple-touch-icon">
  $(
    'link[rel="apple-touch-icon"], link[rel="apple-touch-icon-precomposed"]'
  ).each((_, el) => {
    const href = resolveUrl(baseUrl, $(el).attr("href") || "");
    if (!href) return;
    const sizes = parseSizes($(el).attr("sizes") || undefined);
    candidates.push({
      href,
      type: $(el).attr("type") || undefined,
      sizes: $(el).attr("sizes") || undefined,
      source: "apple-touch-icon",
      ...(sizes && { width: sizes.width, height: sizes.height }),
    });
  });

  // <meta property="og:image"> as last resort from HTML
  $('meta[property="og:image"]').each((_, el) => {
    const content = $(el).attr("content");
    if (!content) return;
    const href = resolveUrl(baseUrl, content);
    if (!href) return;
    candidates.push({
      href,
      source: "meta-image",
    });
  });

  return candidates;
}

export function extractManifestUrl(
  html: string,
  baseUrl: string
): string | null {
  const $ = cheerio.load(html);
  const manifestLink = $('link[rel="manifest"]').attr("href");
  if (!manifestLink) return null;
  return resolveUrl(baseUrl, manifestLink);
}

export function parseManifest(
  manifest: Record<string, unknown>,
  baseUrl: string
): FaviconCandidate[] {
  const candidates: FaviconCandidate[] = [];
  const icons = manifest.icons as
    | Array<{ src: string; sizes?: string; type?: string }>
    | undefined;

  if (!Array.isArray(icons)) return candidates;

  for (const icon of icons) {
    if (!icon.src) continue;
    const href = resolveUrl(baseUrl, icon.src);
    if (!href) continue;
    const sizes = parseSizes(icon.sizes);
    candidates.push({
      href,
      type: icon.type || undefined,
      sizes: icon.sizes || undefined,
      source: "manifest",
      ...(sizes && { width: sizes.width, height: sizes.height }),
    });
  }

  return candidates;
}

const FORMAT_PRIORITY: Record<string, number> = {
  "image/png": 4,
  "image/svg+xml": 5,
  "image/webp": 3,
  "image/jpeg": 2,
  "image/x-icon": 1,
  "image/vnd.microsoft.icon": 1,
};

const SOURCE_PRIORITY: Record<string, number> = {
  manifest: 5,
  "apple-touch-icon": 4,
  "link-icon": 3,
  fallback: 2,
  google: 1,
  "meta-image": 0,
};

export function rankCandidates(
  candidates: FaviconCandidate[]
): FaviconCandidate[] {
  return [...candidates].sort((a, b) => {
    // Prefer larger sizes
    const aSize = a.width || 0;
    const bSize = b.width || 0;
    if (aSize !== bSize) return bSize - aSize;

    // Prefer better formats
    const aFormat = FORMAT_PRIORITY[a.type || ""] || 0;
    const bFormat = FORMAT_PRIORITY[b.type || ""] || 0;
    if (aFormat !== bFormat) return bFormat - aFormat;

    // Prefer better sources
    const aSource = SOURCE_PRIORITY[a.source] || 0;
    const bSource = SOURCE_PRIORITY[b.source] || 0;
    return bSource - aSource;
  });
}
