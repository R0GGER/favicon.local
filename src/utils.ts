export interface ParsedTarget {
  baseUrl: string;
  hostname: string;
  port?: string;
  isPrivateIP: boolean;
}

const PRIVATE_RANGES = [
  { start: [10, 0, 0, 0], mask: 8 },
  { start: [172, 16, 0, 0], mask: 12 },
  { start: [192, 168, 0, 0], mask: 16 },
  { start: [127, 0, 0, 0], mask: 8 },
];

function parseIPv4(ip: string): number[] | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  const nums = parts.map(Number);
  if (nums.some((n) => isNaN(n) || n < 0 || n > 255)) return null;
  return nums;
}

export function isPrivateIP(hostname: string): boolean {
  const octets = parseIPv4(hostname);
  if (!octets) return false;

  for (const range of PRIVATE_RANGES) {
    const maskBits = range.mask;
    const ipNum =
      (octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3];
    const rangeNum =
      (range.start[0] << 24) |
      (range.start[1] << 16) |
      (range.start[2] << 8) |
      range.start[3];
    const mask = ~((1 << (32 - maskBits)) - 1);
    if ((ipNum & mask) === (rangeNum & mask)) return true;
  }
  return false;
}

export function isIPAddress(hostname: string): boolean {
  return parseIPv4(hostname) !== null;
}

export function parseTarget(input: string): ParsedTarget {
  let url: string = input.trim();

  if (url.startsWith("//")) {
    url = "http:" + url;
  }

  if (!/^https?:\/\//i.test(url)) {
    // Could be domain, IP, IP:port, or domain:port
    if (url.includes("://")) {
      url = "http://" + url.replace(/^.*:\/\//, "");
    } else {
      url = "http://" + url;
    }
  }

  // Remove trailing path slashes for base detection but keep the URL usable
  const parsed = new URL(url);
  const hostname = parsed.hostname;
  const port = parsed.port || undefined;
  const baseUrl = `${parsed.protocol}//${parsed.host}`;

  return {
    baseUrl,
    hostname,
    port,
    isPrivateIP: isPrivateIP(hostname),
  };
}

export function resolveUrl(base: string, href: string): string {
  if (!href) return "";
  if (href.startsWith("data:")) return href;
  try {
    return new URL(href, base).href;
  } catch {
    return "";
  }
}

export function getConfig() {
  return {
    port: parseInt(process.env.PORT || "3000", 10),
    cacheTtl: parseInt(process.env.CACHE_TTL || "86400", 10),
    cacheMaxItems: parseInt(process.env.CACHE_MAX_ITEMS || "500", 10),
    requestTimeout: parseInt(process.env.REQUEST_TIMEOUT || "10000", 10),
    maxImageSize: parseInt(process.env.MAX_IMAGE_SIZE || "5242880", 10),
    defaultSize: parseInt(process.env.DEFAULT_SIZE || "32", 10),
    useGoogleFallback: process.env.USE_GOOGLE_FALLBACK !== "false",
  };
}
