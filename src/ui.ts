export function renderUI(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>favicon.local</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg: #0b0f1a;
      --surface: #131825;
      --surface-hover: #1a2035;
      --surface-raised: #1e2540;
      --border: rgba(255, 255, 255, 0.06);
      --border-hover: rgba(255, 255, 255, 0.12);
      --text: #e2e8f0;
      --text-secondary: #8892a8;
      --text-muted: #4a5568;
      --accent: #6366f1;
      --accent-light: #818cf8;
      --accent-glow: rgba(99, 102, 241, 0.15);
      --green: #34d399;
      --green-dim: rgba(52, 211, 153, 0.12);
      --red: #f87171;
      --red-dim: rgba(248, 113, 113, 0.12);
      --radius: 12px;
      --radius-sm: 8px;
      --sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      --mono: 'JetBrains Mono', 'SF Mono', 'Cascadia Code', 'Fira Code', monospace;
    }

    body {
      font-family: var(--sans);
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .hero {
      padding: 5rem 2rem 3rem;
      text-align: center;
      background: radial-gradient(ellipse 80% 50% at 50% -20%, var(--accent-glow), transparent);
    }

    .hero-icon {
      width: 72px;
      height: 72px;
      margin: 0 auto 1.5rem;
      background: linear-gradient(135deg, var(--accent), var(--accent-light));
      border-radius: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 32px rgba(99, 102, 241, 0.25);
    }
    .hero-icon svg { width: 36px; height: 36px; color: white; }

    .hero h1 {
      font-size: 2.25rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      margin-bottom: 0.5rem;
    }
    .hero h1 .dot { color: var(--accent-light); }

    .hero p {
      font-size: 1.1rem;
      color: var(--text-secondary);
      max-width: 440px;
      margin: 0 auto;
      line-height: 1.6;
    }

    .main { max-width: 760px; width: 100%; margin: 0 auto; padding: 0 2rem 4rem; flex: 1; }

    .search-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 1.5rem;
      margin-top: -1rem;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
    }

    .search-row {
      display: flex;
      gap: 0.75rem;
    }

    .search-row input {
      flex: 1;
      padding: 0.875rem 1rem;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      color: var(--text);
      font-family: var(--sans);
      font-size: 1rem;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .search-row input:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px var(--accent-glow);
    }
    .search-row input::placeholder { color: var(--text-muted); }

    .search-row button {
      padding: 0.875rem 1.75rem;
      background: var(--accent);
      border: none;
      border-radius: var(--radius-sm);
      color: white;
      font-family: var(--sans);
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s, transform 0.1s, box-shadow 0.2s;
      white-space: nowrap;
    }
    .search-row button:hover { background: var(--accent-light); box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3); }
    .search-row button:active { transform: scale(0.97); }
    .search-row button:disabled { opacity: 0.5; cursor: default; transform: none; }

    .examples {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 1rem;
    }
    .examples button {
      padding: 0.4rem 0.85rem;
      background: var(--surface-hover);
      border: 1px solid var(--border);
      border-radius: 999px;
      color: var(--text-secondary);
      font-family: var(--mono);
      font-size: 0.8rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .examples button:hover {
      background: var(--surface-raised);
      border-color: var(--border-hover);
      color: var(--text);
    }

    #results { margin-top: 2rem; }

    .status {
      text-align: center;
      padding: 2.5rem 1rem;
      color: var(--text-secondary);
      font-size: 0.95rem;
    }
    .status.loading::after {
      content: '';
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid var(--border);
      border-top-color: var(--accent);
      border-radius: 50%;
      margin-left: 0.5rem;
      vertical-align: middle;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .error-msg {
      text-align: center;
      padding: 1.5rem;
      background: var(--red-dim);
      border: 1px solid rgba(248, 113, 113, 0.2);
      border-radius: var(--radius-sm);
      color: var(--red);
      font-size: 0.95rem;
    }

    .res-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .res-header h2 {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text);
    }
    .res-header .badge {
      font-size: 0.8rem;
      color: var(--text-secondary);
      background: var(--surface);
      padding: 0.3rem 0.7rem;
      border-radius: 999px;
      border: 1px solid var(--border);
    }

    .icon-grid {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .icon-card {
      display: grid;
      grid-template-columns: 56px 1fr auto;
      gap: 1rem;
      align-items: center;
      padding: 1rem 1.25rem;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      transition: all 0.2s;
    }
    .icon-card:hover {
      background: var(--surface-hover);
      border-color: var(--border-hover);
    }

    .icon-preview {
      width: 56px;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg);
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
      overflow: hidden;
    }
    .icon-preview img {
      max-width: 40px;
      max-height: 40px;
      object-fit: contain;
    }

    .icon-info { min-width: 0; }
    .icon-info .source-badge {
      display: inline-block;
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--green);
      background: var(--green-dim);
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
    }
    .icon-info .sizes {
      font-size: 0.8rem;
      color: var(--text-secondary);
      margin-left: 0.5rem;
    }
    .icon-info .href {
      display: block;
      font-size: 0.8rem;
      font-family: var(--mono);
      color: var(--text-muted);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-top: 0.35rem;
    }

    .icon-actions {
      display: flex;
      gap: 0.35rem;
    }
    .icon-actions a {
      font-size: 0.8rem;
      color: var(--text-secondary);
      text-decoration: none;
      padding: 0.4rem 0.75rem;
      border-radius: 6px;
      transition: all 0.15s;
    }
    .icon-actions a:hover {
      background: var(--surface-raised);
      color: var(--text);
    }

    .endpoints {
      margin-top: 1.5rem;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      overflow: hidden;
    }
    .endpoints-title {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-secondary);
      padding: 0.75rem 1.25rem;
      border-bottom: 1px solid var(--border);
    }

    .ep-row {
      display: flex;
      align-items: center;
      padding: 0.75rem 1.25rem;
      gap: 0.75rem;
      border-bottom: 1px solid var(--border);
    }
    .ep-row:last-child { border-bottom: none; }

    .ep-row .ep-label {
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--accent-light);
      min-width: 2.5rem;
    }

    .ep-row code {
      flex: 1;
      font-size: 0.85rem;
      font-family: var(--mono);
      color: var(--text-secondary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      min-width: 0;
    }

    .ep-row .copy-btn {
      background: var(--surface-hover);
      border: 1px solid var(--border);
      border-radius: 6px;
      color: var(--text-secondary);
      font-family: var(--sans);
      font-size: 0.75rem;
      font-weight: 500;
      padding: 0.35rem 0.75rem;
      cursor: pointer;
      transition: all 0.15s;
    }
    .ep-row .copy-btn:hover {
      background: var(--surface-raised);
      border-color: var(--border-hover);
      color: var(--text);
    }
    .ep-row .copy-btn.copied {
      color: var(--green) !important;
      border-color: rgba(52, 211, 153, 0.3);
      background: var(--green-dim);
    }

    footer {
      text-align: center;
      padding: 2rem;
      font-size: 0.85rem;
      color: var(--text-muted);
      border-top: 1px solid var(--border);
    }
    footer a { color: var(--text-secondary); text-decoration: none; }
    footer a:hover { color: var(--accent-light); }

    @media (max-width: 640px) {
      .hero { padding: 3rem 1.5rem 2rem; }
      .hero h1 { font-size: 1.75rem; }
      .hero p { font-size: 0.95rem; }
      .main { padding: 0 1rem 3rem; }
      .search-card { padding: 1rem; }
      .search-row { flex-direction: column; }
      .search-row button { width: 100%; }
      .icon-card { grid-template-columns: 48px 1fr; }
      .icon-actions { display: none; }
      .ep-row { flex-wrap: wrap; }
      .ep-row code { width: 100%; flex: unset; }
    }
  </style>
</head>
<body>
  <div class="hero">
    <div class="hero-icon">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A8.966 8.966 0 0 1 3 12c0-1.97.633-3.794 1.708-5.276" />
      </svg>
    </div>
    <h1>favicon<span class="dot">.</span>local</h1>
    <p>Grab favicons from any domain, local IP, or service on your network</p>
  </div>

  <div class="main">
    <div class="search-card">
      <div class="search-row">
        <input type="text" id="urlInput" placeholder="Enter domain or IP address..." autocomplete="off" spellcheck="false" />
        <button id="fetchBtn">Fetch Icon</button>
      </div>
      <div class="examples" id="examples"></div>
    </div>

    <div id="results"></div>
  </div>

  <footer>favicon.local &mdash; self-hosted favicon service for your homelab</footer>

  <script>
    const $ = (id) => document.getElementById(id);
    const urlInput = $('urlInput');
    const fetchBtn = $('fetchBtn');
    const resultsDiv = $('results');
    const examplesDiv = $('examples');

    const EXAMPLES = ['github.com', 'google.com', 'reddit.com', '192.168.1.1', '10.0.0.1:8080'];

    EXAMPLES.forEach(ex => {
      const btn = document.createElement('button');
      btn.textContent = ex;
      btn.addEventListener('click', () => { urlInput.value = ex; doSearch(); });
      examplesDiv.appendChild(btn);
    });

    urlInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSearch(); });
    fetchBtn.addEventListener('click', doSearch);

    resultsDiv.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-copy]');
      if (!btn) return;
      const text = btn.getAttribute('data-copy');
      navigator.clipboard.writeText(text).then(() => {
        const orig = btn.textContent;
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        setTimeout(() => { btn.textContent = orig; btn.classList.remove('copied'); }, 1500);
      }).catch(() => {});
    });

    async function doSearch() {
      const url = urlInput.value.trim();
      if (!url) return;

      fetchBtn.disabled = true;
      fetchBtn.textContent = 'Fetching...';
      resultsDiv.innerHTML = '<div class="status loading">Searching for icons</div>';

      try {
        const res = await fetch('/api/icons?url=' + encodeURIComponent(url));
        const data = await res.json();

        if (!res.ok) {
          resultsDiv.innerHTML = '<div class="error-msg">' + esc(data.error || 'Request failed') + '</div>';
          return;
        }

        renderResults(data, url);
      } catch (err) {
        resultsDiv.innerHTML = '<div class="error-msg">' + esc(err.message) + '</div>';
      } finally {
        fetchBtn.disabled = false;
        fetchBtn.textContent = 'Fetch Icon';
      }
    }

    function renderResults(data, originalUrl) {
      if (!data.icons || data.icons.length === 0) {
        resultsDiv.innerHTML = '<div class="status">No icons found for this URL</div>';
        return;
      }

      const origin = location.origin;
      const enc = encodeURIComponent(originalUrl).replace(/%3A/gi, ':').replace(/%2F/gi, '/');
      const iconUrl = origin + '/' + enc;
      const jsonUrl = origin + '/api/icons?url=' + enc;
      const imgTag = '<img src="' + iconUrl + '" />';

      let h = '';

      h += '<div class="res-header">';
      h += '<h2>Found ' + data.icons.length + ' icon' + (data.icons.length !== 1 ? 's' : '') + '</h2>';
      h += '<span class="badge">' + esc(data.duration) + '</span>';
      h += '</div>';

      h += '<div class="icon-grid">';
      data.icons.forEach((icon) => {
        h += '<div class="icon-card">';
        h += '<div class="icon-preview">';
        h += '<img src="' + esc(iconUrl) + '?size=64" alt="" loading="lazy" />';
        h += '</div>';
        h += '<div class="icon-info">';
        h += '<span class="source-badge">' + esc(icon.source) + '</span>';
        if (icon.sizes) h += '<span class="sizes">' + esc(icon.sizes) + '</span>';
        h += '<span class="href" title="' + esc(icon.href) + '">' + esc(icon.href) + '</span>';
        h += '</div>';
        h += '<div class="icon-actions">';
        h += '<a href="' + esc(icon.href) + '" target="_blank" rel="noopener">Open</a>';
        h += '<a href="' + esc(iconUrl) + '?size=128&format=png" download="favicon.png">Save</a>';
        h += '</div>';
        h += '</div>';
      });
      h += '</div>';

      h += '<div class="endpoints">';
      h += '<div class="endpoints-title">API Endpoints</div>';

      h += '<div class="ep-row">';
      h += '<span class="ep-label">IMG</span>';
      h += '<code>' + esc(iconUrl) + '</code>';
      h += '<button class="copy-btn" data-copy="' + esc(iconUrl) + '">Copy</button>';
      h += '</div>';

      h += '<div class="ep-row">';
      h += '<span class="ep-label">HTML</span>';
      h += '<code>' + esc(imgTag) + '</code>';
      h += '<button class="copy-btn" data-copy="' + esc(imgTag) + '">Copy</button>';
      h += '</div>';

      h += '<div class="ep-row">';
      h += '<span class="ep-label">JSON</span>';
      h += '<code>' + esc(jsonUrl) + '</code>';
      h += '<button class="copy-btn" data-copy="' + esc(jsonUrl) + '">Copy</button>';
      h += '</div>';

      h += '</div>';

      resultsDiv.innerHTML = h;
    }

    function esc(s) {
      const d = document.createElement('div');
      d.textContent = s;
      return d.innerHTML;
    }
  </script>
</body>
</html>`;
}
