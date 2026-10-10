(() => {
  "use strict";

  // IMPORTANT: set this to the real public APK URL before publishing.
  // If the APK is hosted on a different domain, that server must allow CORS
  // and return Content-Length for accurate progress to be shown here.
  const APK_URL = "/app/downloads/gamerzadda.apk";

  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");
  const year = document.getElementById("year");
  const progressWrap = document.getElementById("progressWrap");
  const progressText = document.getElementById("progressText");
  const progressPercent = document.getElementById("progressPercent");
  const progressBar = document.getElementById("progressBar");
  const progressNote = document.getElementById("progressNote");
  const apkMeta = document.getElementById("apkMeta");

  if (year) year.textContent = String(new Date().getFullYear());

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
      menuToggle.textContent = isOpen ? "✕" : "☰";
    });
    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open menu");
        menuToggle.textContent = "☰";
      });
    });
  }

  // Optional: populate file size/version from the APK host's response headers.
  async function loadApkInfo() {
    try {
      const response = await fetch(APK_URL, { method: "HEAD", cache: "no-store" });
      if (!response.ok) return;
      const size = Number(response.headers.get("content-length"));
      const version = response.headers.get("x-app-version");
      const details = [];
      if (version) details.push(`Version ${version}`);
      if (Number.isFinite(size) && size > 0) details.push(`${(size / (1024 * 1024)).toFixed(1)} MB`);
      if (details.length && apkMeta) apkMeta.textContent = `${details.join(" · ")} · Android`;
    } catch (_) {
      // Keep generic metadata; a failed HEAD request should not block downloads.
    }
  }
  loadApkInfo();

  function showProgress(message, note) {
    if (!progressWrap) return;
    progressWrap.hidden = false;
    progressText.textContent = message;
    progressNote.textContent = note;
  }
  function setProgress(percent) {
    const safePercent = Math.max(0, Math.min(100, percent));
    progressBar.style.width = `${safePercent}%`;
    progressPercent.textContent = `${Math.round(safePercent)}%`;
  }

  async function downloadWithProgress() {
    showProgress("Connecting to download…", "If progress is unavailable, the browser will open the APK directly.");
    setProgress(0);

    try {
      const response = await fetch(APK_URL, { cache: "no-store" });
      if (!response.ok) throw new Error(`Download returned HTTP ${response.status}`);
      if (!response.body || !response.body.getReader) throw new Error("Streaming is not supported");
      const total = Number(response.headers.get("content-length"));
      const reader = response.body.getReader();
      const chunks = [];
      let received = 0;

      while (true) {
        const result = await reader.read();
        if (result.done) break;
        chunks.push(result.value);
        received += result.value.byteLength;
        if (total > 0) {
          setProgress(received / total * 100);
          progressText.textContent = "Downloading APK…";
          progressNote.textContent = `${(received / 1048576).toFixed(1)} MB of ${(total / 1048576).toFixed(1)} MB`;
        } else {
          progressText.textContent = "Downloading APK…";
          progressNote.textContent = `${(received / 1048576).toFixed(1)} MB downloaded`;
        }
      }

      const blob = new Blob(chunks, { type: "application/vnd.android.package-archive" });
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = "gamerzadda.apk";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
      setProgress(100);
      progressText.textContent = "Download ready";
      progressNote.textContent = "Check your browser's Downloads list to open the APK.";
    } catch (error) {
      // Cross-origin CORS or streaming issues: let the browser handle the file.
      progressText.textContent = "Opening browser download…";
      progressNote.textContent = "Your browser will manage the APK download. Progress may not be available here.";
      const fallback = document.createElement("a");
      fallback.href = APK_URL;
      fallback.download = "gamerzadda.apk";
      fallback.rel = "noopener";
      document.body.appendChild(fallback);
      fallback.click();
      fallback.remove();
      if (progressBar) progressBar.style.width = "100%";
      if (progressPercent) progressPercent.textContent = "—";
    }
  }

  document.querySelectorAll(".download-link").forEach((link) => {
    link.setAttribute("href", APK_URL);
    link.addEventListener("click", (event) => {
      // Preserve normal browser download if JS is disabled or data saver behavior interferes.
      event.preventDefault();
      downloadWithProgress();
    });
  });
})();