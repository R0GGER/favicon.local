import sharp from "sharp";

export type OutputFormat = "png" | "jpg" | "webp" | "ico";

const MIME_TYPES: Record<OutputFormat, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  webp: "image/webp",
  ico: "image/x-icon",
};

export function getMimeType(format: OutputFormat): string {
  return MIME_TYPES[format] || "image/png";
}

export function detectFormat(
  contentType?: string,
  url?: string
): OutputFormat | null {
  if (contentType) {
    if (contentType.includes("png")) return "png";
    if (contentType.includes("jpeg") || contentType.includes("jpg"))
      return "jpg";
    if (contentType.includes("webp")) return "webp";
    if (contentType.includes("icon") || contentType.includes("x-icon"))
      return "ico";
    if (contentType.includes("svg")) return null; // SVG handled separately
  }
  if (url) {
    const ext = url.split("?")[0].split(".").pop()?.toLowerCase();
    if (ext === "png") return "png";
    if (ext === "jpg" || ext === "jpeg") return "jpg";
    if (ext === "webp") return "webp";
    if (ext === "ico") return "ico";
    if (ext === "svg") return null;
  }
  return null;
}

export function isSVG(
  buffer: Buffer | Uint8Array,
  contentType?: string
): boolean {
  if (contentType?.includes("svg")) return true;
  const head = Buffer.from(buffer.slice(0, 256)).toString("utf-8").trim();
  return head.startsWith("<svg") || head.startsWith("<?xml");
}

export async function processImage(
  buffer: Buffer | Uint8Array,
  options: {
    size?: number;
    format?: OutputFormat;
  }
): Promise<{ data: Buffer; format: OutputFormat; mimeType: string }> {
  const { size, format = "png" } = options;

  let pipeline = sharp(Buffer.from(buffer));

  if (size && size >= 16 && size <= 512) {
    pipeline = pipeline.resize(size, size, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    });
  }

  switch (format) {
    case "jpg":
      pipeline = pipeline.jpeg({ quality: 90 });
      break;
    case "webp":
      pipeline = pipeline.webp({ quality: 90 });
      break;
    case "ico":
    case "png":
    default:
      pipeline = pipeline.png();
      break;
  }

  const data = await pipeline.toBuffer();
  return { data, format: format === "ico" ? "png" : format, mimeType: getMimeType(format) };
}

export function generatePlaceholder(letter: string, size: number = 64): Promise<Buffer> {
  const svgSize = Math.max(size, 32);
  const fontSize = Math.round(svgSize * 0.55);

  const hue = letter.charCodeAt(0) * 37 % 360;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgSize}" height="${svgSize}" viewBox="0 0 ${svgSize} ${svgSize}">
    <rect width="100%" height="100%" rx="${Math.round(svgSize * 0.15)}" fill="hsl(${hue}, 55%, 45%)"/>
    <text x="50%" y="50%" dy=".1em" font-family="system-ui, -apple-system, sans-serif"
      font-size="${fontSize}" font-weight="600" fill="white"
      text-anchor="middle" dominant-baseline="central">${letter.toUpperCase()}</text>
  </svg>`;

  return sharp(Buffer.from(svg)).resize(size, size).png().toBuffer();
}
