import { Hono } from "hono";
import { cors } from "hono/cors";
import { getConnInfo } from "hono/bun";
import { ipRestriction } from "hono/ip-restriction";
import { getConfig } from "./utils.js";
import { fetchFavicon, discoverFavicons } from "./fetcher.js";
import { renderUI } from "./ui.js";
import type { OutputFormat } from "./image.js";

const config = getConfig();
const app = new Hono();

app.use(
  "*",
  ipRestriction(getConnInfo, {
    denyList: [],
    allowList: [
      "127.0.0.0/8",
      "10.0.0.0/8",
      "172.16.0.0/12",
      "192.168.0.0/16",
      "::1",
      "fe80::/10",
      "fc00::/7",
    ],
  }, async (remote, c) => {
    return c.json(
      { error: "Access denied: this service is restricted to local network only" },
      403
    );
  })
);

app.use("*", cors());

app.get("/", (c) => {
  return c.html(renderUI());
});

app.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/icon", async (c) => {
  const url = c.req.query("url");
  if (!url) {
    return c.json({ error: "Missing required parameter: url" }, 400);
  }

  const size = parseInt(c.req.query("size") || String(config.defaultSize), 10);
  const format = (c.req.query("format") || "png") as OutputFormat;

  const validFormats = ["png", "jpg", "webp", "ico"];
  if (!validFormats.includes(format)) {
    return c.json({ error: "Invalid format. Use: png, jpg, webp, ico" }, 400);
  }

  if (isNaN(size) || size < 16 || size > 512) {
    return c.json({ error: "Size must be between 16 and 512" }, 400);
  }

  try {
    const result = await fetchFavicon(url, { size, format });
    return new Response(result.data, {
      headers: {
        "Content-Type": result.mimeType,
        "Cache-Control": `public, max-age=${config.cacheTtl}`,
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("Error fetching favicon:", err);
    return c.json({ error: "Failed to fetch favicon" }, 500);
  }
});

app.get("/api/icons", async (c) => {
  const url = c.req.query("url");
  if (!url) {
    return c.json({ error: "Missing required parameter: url" }, 400);
  }

  try {
    const result = await discoverFavicons(url);
    return c.json(result, 200, {
      "Cache-Control": `public, max-age=${config.cacheTtl}`,
    });
  } catch (err) {
    console.error("Error discovering favicons:", err);
    return c.json({ error: "Failed to discover favicons" }, 500);
  }
});

const RESERVED = new Set(["", "health", "icon", "api", "favicon.ico"]);

app.get("/*", async (c) => {
  const target = c.req.path.slice(1);
  if (!target || RESERVED.has(target.split("/")[0])) {
    return c.json({ error: "Not found" }, 404);
  }

  const size = parseInt(c.req.query("size") || String(config.defaultSize), 10);
  const format = (c.req.query("format") || "png") as OutputFormat;

  const validFormats = ["png", "jpg", "webp", "ico"];
  if (!validFormats.includes(format)) {
    return c.json({ error: "Invalid format. Use: png, jpg, webp, ico" }, 400);
  }

  if (isNaN(size) || size < 16 || size > 512) {
    return c.json({ error: "Size must be between 16 and 512" }, 400);
  }

  try {
    const result = await fetchFavicon(target, { size, format });
    return new Response(result.data, {
      headers: {
        "Content-Type": result.mimeType,
        "Cache-Control": `public, max-age=${config.cacheTtl}`,
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("Error fetching favicon:", err);
    return c.json({ error: "Failed to fetch favicon" }, 500);
  }
});

console.log(`Favicon Service starting on port ${config.port}`);

export default {
  port: config.port,
  fetch: app.fetch,
};
