# Favicon Local

A self-hosted favicon service for homelabs and local dashboards. Fetches favicons from public domains, local IPs, and IP:port combinations on your network.

> Built with [Cursor](https://www.cursor.com).

## Quick Start

```yaml
services:
  favicon:
    image: ghcr.io/r0gger/favicon.local:latest
    restart: unless-stopped
    ports:
      - "3100:3000"
    environment:
      - PORT=3000
      - CACHE_TTL=86400
      - CACHE_MAX_ITEMS=500
      - REQUEST_TIMEOUT=10000
      - MAX_IMAGE_SIZE=5242880
      - DEFAULT_SIZE=32
      - USE_GOOGLE_FALLBACK=true
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 10s
```

The service starts on [http://localhost:3000](http://localhost:3000).

## Security

> **Warning:** This service is designed for **local network use only**. Do not expose it to the public internet.

## Usage

```html
<img src="http://localhost:3000/icon?url=github.com" />
<img src="http://localhost:3000/icon?url=192.168.1.111:7878" />
<img src="http://localhost:3000/icon?url=10.0.0.5:8080&size=64&format=png" />
```

| Parameter | Default | Description |
|-----------|---------|-------------|
| `url` | — | Domain, IP, IP:port, or full URL (required) |
| `size` | 32 | Output size in pixels (16–512) |
| `format` | png | Output format: `png`, `jpg`, `webp`, `ico` |

A JSON endpoint is also available at `/api/icons?url=...` and a health check at `/health`.

## Configuration

All settings are configurable via environment variables in `docker-compose.yml`:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3000 | Server port |
| `CACHE_TTL` | 86400 | Cache duration in seconds (24h) |
| `CACHE_MAX_ITEMS` | 500 | Maximum cached items |
| `REQUEST_TIMEOUT` | 10000 | Fetch timeout in ms |
| `MAX_IMAGE_SIZE` | 5242880 | Max image size in bytes (5MB) |
| `DEFAULT_SIZE` | 32 | Default favicon output size |
| `USE_GOOGLE_FALLBACK` | true | Use Google's favicon API as fallback |

