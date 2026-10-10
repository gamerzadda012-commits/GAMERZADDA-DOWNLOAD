(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const root = document.documentElement;
  // Always dismiss the startup loader, even if another feature fails later.
  function dismissSiteLoader() {
    const loader = $('site-loader');
    if (!loader) return;
    loader.classList.add('done');
    window.setTimeout(() => { if (loader.isConnected) loader.remove(); }, 600);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', dismissSiteLoader, { once: true });
  else dismissSiteLoader();
  window.setTimeout(dismissSiteLoader, 1800);
  const lightThemeButton = $('theme-light');
  const darkThemeButton = $('theme-dark');
  const menuButton = $('menu-toggle');
  const nav = $('nav-links');
  const year = $('year');
  const modal = $('download-modal');
  const closeButton = $('download-close');
  const progressFill = $('download-progress-fill');
  const percent = $('download-percent');
  const sizeLabel = $('download-size');
  const title = $('download-title');
  const message = $('download-message');
  const hint = $('download-hint');
  const fallback = $('download-fallback');
  const APK_URL = '/app/downloads/gamerzadda.apk';
  if (year) year.textContent = String(new Date().getFullYear());

  function setTheme(theme) {
    const dark = theme === 'dark';
    if (dark) root.dataset.theme = 'dark'; else delete root.dataset.theme;
    root.style.colorScheme = dark ? 'dark' : 'light';
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) themeColor.setAttribute('content', dark ? '#111321' : '#ff174f');
    try { localStorage.setItem('gz-theme', dark ? 'dark' : 'light'); } catch (_) {}
    if (lightThemeButton) lightThemeButton.setAttribute('aria-pressed', String(!dark));
    if (darkThemeButton) darkThemeButton.setAttribute('aria-pressed', String(dark));
  }
  let initialTheme = 'light';
  try { initialTheme = localStorage.getItem('gz-theme') === 'dark' ? 'dark' : 'light'; } catch (_) {}
  setTheme(root.dataset.theme === 'dark' ? 'dark' : initialTheme);
  lightThemeButton?.addEventListener('click', () => setTheme('light'));
  darkThemeButton?.addEventListener('click', () => setTheme('dark'));

  menuButton?.addEventListener('click', () => {
    const open = nav?.classList.toggle('open') || false;
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    menuButton.textContent = open ? '×' : '☰';
  });
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open'); menuButton?.setAttribute('aria-expanded', 'false');
    if (menuButton) { menuButton.textContent = '☰'; menuButton.setAttribute('aria-label', 'Open navigation'); }
  }));

  function openModal() {
    if (!modal) return false;
    modal.hidden = false; modal.setAttribute('aria-hidden', 'false'); modal.classList.add('is-open');
    document.body.classList.add('modal-open');
    if (progressFill) progressFill.style.width = '0%';
    if (percent) percent.textContent = '0%';
    if (sizeLabel) sizeLabel.textContent = 'Checking file size…';
    if (title) title.textContent = 'Preparing your download…';
    if (message) message.textContent = 'Connecting securely to GAMERZADDA APK';
    if (hint) hint.textContent = 'Keep this window open while the APK downloads.';
    if (fallback) fallback.hidden = true;
    startDownload(); return true;
  }
  function closeModal() { if (!modal) return; modal.classList.remove('is-open'); modal.setAttribute('aria-hidden','true'); modal.hidden = true; document.body.classList.remove('modal-open'); }
  closeButton?.addEventListener('click', closeModal);
  modal?.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
  document.querySelectorAll('[data-download]').forEach(link => link.addEventListener('click', e => {
    if (modal) { e.preventDefault(); openModal(); }
  }));
  async function startDownload() {
    if (!modal) return;
    try {
      const response = await fetch(APK_URL, { cache: 'no-store' });
      if (!response.ok || !response.body?.getReader) throw new Error('Streaming unavailable');
      const total = Number(response.headers.get('content-length'));
      const reader = response.body.getReader(); const chunks = []; let received = 0;
      while (true) {
        const {done, value} = await reader.read(); if (done) break;
        chunks.push(value); received += value.byteLength;
        if (total > 0) {
          const p = Math.min(100, received / total * 100);
          if (progressFill) progressFill.style.width = p + '%';
          if (percent) percent.textContent = Math.round(p) + '%';
          if (sizeLabel) sizeLabel.textContent = `${(received/1048576).toFixed(1)} MB / ${(total/1048576).toFixed(1)} MB`;
          if (title) title.textContent = 'Downloading GAMERZADDA…';
          if (message) message.textContent = 'Your APK is being downloaded securely.';
        }
      }
      const blob = new Blob(chunks, {type:'application/vnd.android.package-archive'});
      const url = URL.createObjectURL(blob); const a = document.createElement('a');
      a.href = url; a.download = 'gamerzadda.apk'; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
      if (progressFill) progressFill.style.width = '100%'; if (percent) percent.textContent = '100%';
      if (title) title.textContent = 'Download ready!'; if (message) message.textContent = 'GAMERZADDA APK download has started.';
      if (hint) hint.textContent = 'Open the downloaded APK on your Android device to continue installation.';
    } catch (_) {
      if (title) title.textContent = 'Continue APK download';
      if (message) message.textContent = 'Your browser may not support in-page progress. Use the button below to download directly.';
      if (hint) hint.textContent = 'The direct download opens the APK from the official website.';
      if (fallback) fallback.hidden = false;
      if (sizeLabel) sizeLabel.textContent = 'Direct download available';
    }
  }
  // If a browser doesn't support streaming, keep the direct-download fallback visible.
  document.querySelectorAll('.download-retry').forEach(a => a.href = APK_URL);
})();
