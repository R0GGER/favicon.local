import {
  parseHTML,
  extractManifestUrl,
  parseManifest,
  rankCandidates,
  type FaviconCandidate,
} from "./parser.js";
import {
  processImage,
  isSVG,
  generatePlaceholder,
  type OutputFormat,
} from "./image.js";
import { parseTarget, getConfig, type ParsedTarget } from "./utils.js";
import { LRUCache } from "./cache.js";

export interface FaviconResult {
  url: string;
  icons: FaviconCandidate[];
  best?: FaviconCandidate;
  duration: string;
}

export interface FaviconImageResult {
  data: Buffer;
  mimeType: string;
  format: string;
}

const config = getConfig();
const imageCache = new LRUCache<FaviconImageResult>(
  config.cacheMaxItems,
  config.cacheTtl
);
const discoveryCache = new LRUCache<FaviconCandidate[]>(
  config.cacheMaxItems,
  config.cacheTtl
);

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.requestTimeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "User-Agent": USER_AGENT,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/*;q=0.8",
        ...((options.headers as Record<string, string>) || {}),
      },
      redirect: "follow",
    });
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchImageBuffer(url: string): Promise<{
  buffer: Buffer;
  contentType: string;
} | null> {
  try {
    const response = await fetchWithTimeout(url, {
      headers: { Accept: "image/*,*/*;q=0.8" },
    });

    if (!response.ok) return null;

    const contentType = response.headers.get("content-type") || "";
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length === 0 || buffer.length > config.maxImageSize) return null;

    return { buffer, contentType };
  } catch {
    return null;
  }
}

async function discoverFromHTML(
  target: ParsedTarget
): Promise<FaviconCandidate[]> {
  try {
    const response = await fetchWithTimeout(target.baseUrl);
    if (!response.ok) return [];

    const html = await response.text();
    const candidates = parseHTML(html, target.baseUrl);

    // Try manifest
    const manifestUrl = extractManifestUrl(html, target.baseUrl);
    if (manifestUrl) {
      try {
        const manifestRes = await fetchWithTimeout(manifestUrl);
        if (manifestRes.ok) {
          const manifestJson = await manifestRes.json();
          const manifestDir = manifestUrl.substring(
            0,
            manifestUrl.lastIndexOf("/") + 1
          );
          candidates.push(...parseManifest(manifestJson, manifestDir));
        }
      } catch {
        // Manifest fetch failed, continue
      }
    }

    return candidates;
  } catch {
    return [];
  }
}

function getFallbackPaths(baseUrl: string): FaviconCandidate[] {
  const paths = [
    "/favicon.ico",
    "/favicon.png",
    "/apple-touch-icon.png",
    "/apple-touch-icon-precomposed.png",
  ];

  return paths.map((path) => ({
    href: `${baseUrl}${path}`,
    source: "fallback" as const,
  }));
}

async function fetchGoogleFavicon(
  hostname: string
): Promise<FaviconCandidate | null> {
  const url = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=128`;
  try {
    const result = await fetchImageBuffer(url);
    if (!result) return null;
    return {
      href: url,
      source: "google",
      sizes: "128x128",
      width: 128,
      height: 128,
    };
  } catch {
    return null;
  }
}

async function validateCandidate(
  candidate: FaviconCandidate
): Promise<boolean> {
  if (candidate.href.startsWith("data:")) return true;
  const result = await fetchImageBuffer(candidate.href);
  return result !== null;
}

export async function discoverFavicons(
  input: string
): Promise<FaviconResult> {
  const start = performance.now();
  const target = parseTarget(input);

  const cacheKey = `discover:${target.baseUrl}`;
  const cached = discoveryCache.get(cacheKey);
  if (cached) {
    const duration = `${((performance.now() - start) / 1000).toFixed(3)} s`;
    const ranked = rankCandidates(cached);
    return {
      url: target.baseUrl,
      icons: ranked,
      best: ranked[0],
      duration,
    };
  }

  // Discover from HTML
  let candidates = await discoverFromHTML(target);

  // Add fallback paths
  const fallbacks = getFallbackPaths(target.baseUrl);
  candidates.push(...fallbacks);

  // Deduplicate by href
  const seen = new Set<string>();
  candidates = candidates.filter((c) => {
    if (seen.has(c.href)) return false;
    seen.add(c.href);
    return true;
  });

  // Validate candidates (check which ones actually resolve to images)
  const validationResults = await Promise.allSettled(
    candidates.map(async (c) => {
      const valid = await validateCandidate(c);
      return { candidate: c, valid };
    })
  );

  let validCandidates = validationResults
    .filter(
      (r): r is PromiseFulfilledResult<{ candidate: FaviconCandidate; valid: boolean }> =>
        r.status === "fulfilled" && r.value.valid
    )
    .map((r) => r.value.candidate);

  // Google fallback for public domains
  if (
    validCandidates.length === 0 &&
    !target.isPrivateIP &&
    config.useGoogleFallback
  ) {
    const googleResult = await fetchGoogleFavicon(target.hostname);
    if (googleResult) {
      validCandidates.push(googleResult);
    }
  }

  const ranked = rankCandidates(validCandidates);
  discoveryCache.set(cacheKey, ranked);

  const duration = `${((performance.now() - start) / 1000).toFixed(3)} s`;
  return {
    url: target.baseUrl,
    icons: ranked,
    best: ranked[0],
    duration,
  };
}

export async function fetchFavicon(
  input: string,
  options: { size?: number; format?: OutputFormat } = {}
): Promise<FaviconImageResult> {
  const size = options.size || config.defaultSize;
  const format = options.format || "png";
  const target = parseTarget(input);

  const cacheKey = `icon:${target.baseUrl}:${size}:${format}`;
  const cached = imageCache.get(cacheKey);
  if (cached) return cached;

  const discovery = await discoverFavicons(input);

  if (discovery.best) {
    let imageData: { buffer: Buffer; contentType: string } | null = null;

    // Try the best candidate, then fall through others
    for (const candidate of discovery.icons) {
      if (candidate.href.startsWith("data:")) {
        const match = candidate.href.match(
          /^data:[^;]+;base64,(.+)$/
        );
        if (match) {
          imageData = {
            buffer: Buffer.from(match[1], "base64"),
            contentType:
              candidate.href.match(/^data:([^;]+)/)?.[1] || "image/png",
          };
          break;
        }
        continue;
      }

      imageData = await fetchImageBuffer(candidate.href);
      if (imageData) break;
    }

    if (imageData) {
      // Handle SVG specially
      if (isSVG(imageData.buffer, imageData.contentType)) {
        const result = await processImage(imageData.buffer, { size, format });
        const faviconResult: FaviconImageResult = {
          data: result.data,
          mimeType: result.mimeType,
          format: result.format,
        };
        imageCache.set(cacheKey, faviconResult);
        return faviconResult;
      }

      const result = await processImage(imageData.buffer, { size, format });
      const faviconResult: FaviconImageResult = {
        data: result.data,
        mimeType: result.mimeType,
        format: result.format,
      };
      imageCache.set(cacheKey, faviconResult);
      return faviconResult;
    }
  }

  // Last resort: generate a letter placeholder
  const letter = target.hostname.replace(/^\d+\.\d+\.\d+\.\d+$/, "").charAt(0) || target.hostname.charAt(0);
  const placeholder = await generatePlaceholder(letter, size);
  const result: FaviconImageResult = {
    data: placeholder,
    mimeType: "image/png",
    format: "png",
  };
  imageCache.set(cacheKey, result);
  return result;
}
