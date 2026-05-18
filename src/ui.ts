export function renderUI(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>favicon.local</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg: #111;
      --surface: #191919;
      --surface-alt: #1e1e1e;
      --border: #2a2a2a;
      --border-light: #333;
      --text: #ccc;
      --text-dim: #666;
      --text-bright: #eee;
      --green: #4a7;
      --red: #a44;
      --mono: 'SF Mono', 'Cascadia Code', 'JetBrains Mono', 'Fira Code', Consolas, monospace;
    }

    body {
      font-family: var(--mono);
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      padding: 3rem 1.5rem 2rem;
    }

    .wrap { max-width: 680px; margin: 0 auto; }

    .logo {
      font-size: 0.8rem;
      color: var(--text-dim);
      margin-bottom: 2rem;
      letter-spacing: 0.08em;
    }
    .logo span { color: var(--green); }

    .search {
      display: flex;
      border: 1px solid var(--border);
      background: var(--surface);
      transition: border-color 0.2s;
    }
    .search:focus-within { border-color: var(--border-light); }

    .search .prompt {
      padding: 0.7rem 0 0.7rem 0.9rem;
      color: var(--text-dim);
      user-select: none;
      font-size: 0.85rem;
      line-height: 1.5;
    }

    .search input {
      flex: 1;
      padding: 0.7rem 0.5rem;
      background: none;
      border: none;
      color: var(--text-bright);
      font-family: var(--mono);
      font-size: 0.85rem;
      outline: none;
    }
    .search input::placeholder { color: #444; }

    .search button {
      padding: 0.7rem 1.2rem;
      background: none;
      border: none;
      border-left: 1px solid var(--border);
      color: var(--text-dim);
      font-family: var(--mono);
      font-size: 0.8rem;
      cursor: pointer;
      transition: color 0.15s, background 0.15s;
    }
    .search button:hover { color: var(--text-bright); background: var(--surface-alt); }
    .search button:disabled { opacity: 0.4; cursor: default; }

    .quick {
      display: flex;
      gap: 0;
      margin-top: 0.6rem;
      font-size: 0.75rem;
    }
    .quick button {
      padding: 0.3rem 0.7rem;
      background: none;
      border: none;
      color: var(--text-dim);
      font-family: var(--mono);
      font-size: 0.75rem;
      cursor: pointer;
      transition: color 0.15s;
    }
    .quick button:hover { color: var(--text); }
    .quick button::before { content: '/'; color: #333; margin-right: 0.15rem; }

    #results { margin-top: 2rem; }

    .status { color: var(--text-dim); font-size: 0.8rem; }
    .error { color: var(--red); font-size: 0.8rem; }

    .res-head {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      padding-bottom: 0.6rem;
      border-bottom: 1px solid var(--border);
      margin-bottom: 0.8rem;
    }
    .res-head h2 { font-size: 0.8rem; font-weight: 400; color: var(--text); }
    .res-head .dur { font-size: 0.75rem; color: var(--text-dim); }

    .icon-list { display: flex; flex-direction: column; gap: 1px; }

    .icon-row {
      display: grid;
      grid-template-columns: 36px 1fr auto;
      gap: 0.8rem;
      align-items: center;
      padding: 0.55rem 0.6rem;
      background: var(--surface);
      transition: background 0.1s;
    }
    .icon-row:hover { background: var(--surface-alt); }

    .icon-thumb {
      width: 36px; height: 36px;
      display: flex; align-items: center; justify-content: center;
      background: var(--bg);
      overflow: hidden;
    }
    .icon-thumb img { max-width: 28px; max-height: 28px; object-fit: contain; }

    .icon-meta { min-width: 0; }
    .icon-meta .tag {
      font-size: 0.65rem;
      color: var(--green);
      text-transform: lowercase;
      letter-spacing: 0.03em;
    }
    .icon-meta .dim {
      font-size: 0.7rem;
      color: var(--text-dim);
      margin-left: 0.5rem;
    }
    .icon-meta .url-line {
      font-size: 0.7rem;
      color: #444;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-top: 0.1rem;
    }

    .icon-acts {
      display: flex;
      gap: 0.4rem;
    }
    .icon-acts a {
      font-size: 0.7rem;
      color: var(--text-dim);
      text-decoration: none;
      padding: 0.2rem 0.45rem;
      border: 1px solid transparent;
      transition: color 0.15s, border-color 0.15s;
    }
    .icon-acts a:hover {
      color: var(--text);
      border-color: var(--border);
    }

    .api-block {
      margin-top: 1.5rem;
      border: 1px solid var(--border);
      background: var(--surface);
    }
    .api-block-title {
      font-size: 0.7rem;
      color: var(--text-dim);
      padding: 0.5rem 0.7rem;
      border-bottom: 1px solid var(--border);
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .api-row {
      display: flex;
      align-items: center;
      padding: 0.45rem 0.7rem;
      border-bottom: 1px solid #1a1a1a;
      gap: 0.5rem;
    }
    .api-row:last-child { border-bottom: none; }

    .api-row .label {
      font-size: 0.65rem;
      color: var(--text-dim);
      min-width: 3rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .api-row code {
      flex: 1;
      font-size: 0.75rem;
      color: var(--green);
      font-family: var(--mono);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      min-width: 0;
    }

    .api-row button {
      background: none;
      border: 1px solid var(--border);
      color: var(--text-dim);
      font-family: var(--mono);
      font-size: 0.65rem;
      padding: 0.2rem 0.5rem;
      cursor: pointer;
      transition: color 0.15s, border-color 0.15s;
    }
    .api-row button:hover { color: var(--text); border-color: var(--border-light); }

    .copied { color: var(--green) !important; }

    footer {
      margin-top: 3rem;
      font-size: 0.7rem;
      color: #333;
    }

    @media (max-width: 500px) {
      body { padding: 1.5rem 1rem; }
      .icon-row { grid-template-columns: 32px 1fr; }
      .icon-acts { display: none; }
    }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="logo">$ <span>favicon</span>.local</div>

    <div class="search">
      <div class="prompt">&gt;</div>
      <input type="text" id="urlInput" placeholder="target" autocomplete="off" spellcheck="false" />
      <button id="fetchBtn">fetch</button>
    </div>

    <div class="quick" id="examples"></div>

    <div id="results"></div>

    <footer>favicon.local &mdash; grab icons from anything on your network</footer>
  </div>

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
        btn.textContent = 'ok';
        btn.classList.add('copied');
        setTimeout(() => { btn.textContent = orig; btn.classList.remove('copied'); }, 1200);
      }).catch(() => {});
    });

    async function doSearch() {
      const url = urlInput.value.trim();
      if (!url) return;

      fetchBtn.disabled = true;
      fetchBtn.textContent = '...';
      resultsDiv.innerHTML = '<div class="status">fetching...</div>';

      try {
        const res = await fetch('/api/icons?url=' + encodeURIComponent(url));
        const data = await res.json();

        if (!res.ok) {
          resultsDiv.innerHTML = '<div class="error">err: ' + esc(data.error || 'request failed') + '</div>';
          return;
        }

        renderResults(data, url);
      } catch (err) {
        resultsDiv.innerHTML = '<div class="error">err: ' + esc(err.message) + '</div>';
      } finally {
        fetchBtn.disabled = false;
        fetchBtn.textContent = 'fetch';
      }
    }

    function renderResults(data, originalUrl) {
      if (!data.icons || data.icons.length === 0) {
        resultsDiv.innerHTML = '<div class="status">no icons found</div>';
        return;
      }

      const origin = location.origin;
      const enc = encodeURIComponent(originalUrl).replace(/%3A/gi, ':').replace(/%2F/gi, '/');
      const iconUrl = origin + '/' + enc;
      const jsonUrl = origin + '/api/icons?url=' + enc;
      const imgTag = '<img src="' + iconUrl + '" />';

      let h = '';

      h += '<div class="res-head">';
      h += '<h2>' + data.icons.length + ' icons</h2>';
      h += '<span class="dur">' + esc(data.duration) + '</span>';
      h += '</div>';

      h += '<div class="icon-list">';
      data.icons.forEach((icon) => {
        h += '<div class="icon-row">';
        h += '<div class="icon-thumb">';
        h += '<img src="' + esc(iconUrl) + '?size=48" alt="" loading="lazy" />';
        h += '</div>';
        h += '<div class="icon-meta">';
        h += '<span class="tag">' + esc(icon.source) + '</span>';
        if (icon.sizes) h += '<span class="dim">' + esc(icon.sizes) + '</span>';
        h += '<div class="url-line" title="' + esc(icon.href) + '">' + esc(icon.href) + '</div>';
        h += '</div>';
        h += '<div class="icon-acts">';
        h += '<a href="' + esc(icon.href) + '" target="_blank" rel="noopener">open</a>';
        h += '<a href="' + esc(iconUrl) + '?size=128&format=png" download="favicon.png">save</a>';
        h += '</div>';
        h += '</div>';
      });
      h += '</div>';

      h += '<div class="api-block">';
      h += '<div class="api-block-title">endpoints</div>';

      h += '<div class="api-row">';
      h += '<span class="label">img</span>';
      h += '<code>' + esc(iconUrl) + '</code>';
      h += '<button data-copy="' + esc(iconUrl) + '">copy</button>';
      h += '</div>';

      h += '<div class="api-row">';
      h += '<span class="label">html</span>';
      h += '<code>' + esc(imgTag) + '</code>';
      h += '<button data-copy="' + esc(imgTag) + '">copy</button>';
      h += '</div>';

      h += '<div class="api-row">';
      h += '<span class="label">json</span>';
      h += '<code>' + esc(jsonUrl) + '</code>';
      h += '<button data-copy="' + esc(jsonUrl) + '">copy</button>';
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
