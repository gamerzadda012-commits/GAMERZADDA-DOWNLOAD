(() => {
  "use strict";
  const loader = document.getElementById("site-loader");
  const hideLoader = () => { if (loader) loader.classList.add("done"); };
  window.addEventListener("load", () => setTimeout(hideLoader, 300), { once: true });
  setTimeout(hideLoader, 1800);

  const menuButton = document.getElementById("menu-toggle");
  const nav = document.getElementById("nav-links");
  if (menuButton && nav) {
    menuButton.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
      menuButton.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
      menuButton.textContent = isOpen ? "✕" : "☰";
    });
    nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
      nav.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Open navigation");
      menuButton.textContent = "☰";
    }));
  }

  const modal = document.getElementById("download-modal");
  const closeButton = document.getElementById("download-close");
  const title = document.getElementById("download-title");
  const message = document.getElementById("download-message");
  const fill = document.getElementById("download-progress-fill");
  const percent = document.getElementById("download-percent");
  const sizeLabel = document.getElementById("download-size");
  const hint = document.getElementById("download-hint");
  const fallback = document.getElementById("download-fallback");
  const apkUrl = "/app/downloads/gamerzadda.apk";
  let activeController = null;

  const bytes = n => {
    if (!Number.isFinite(n) || n < 0) return "Size unknown";
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
    return `${(n / (1024 * 1024)).toFixed(2)} MB`;
  };
  const showModal = () => {
    if (!modal) return;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };
  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (activeController) activeController.abort();
  };
  closeButton?.addEventListener("click", closeModal);
  modal?.addEventListener("click", e => { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

  async function downloadApk() {
    showModal();
    if (fallback) fallback.hidden = true;
    if (fill) fill.style.width = "0%";
    if (percent) percent.textContent = "0%";
    if (sizeLabel) sizeLabel.textContent = "Checking APK size…";
    if (title) title.textContent = "Preparing your download…";
    if (message) message.textContent = "Connecting securely to GAMERZADDA APK";
    if (hint) hint.textContent = "The exact file size and download progress will appear here.";
    activeController = new AbortController();
    try {
      const response = await fetch(apkUrl, { signal: activeController.signal, cache: "no-store" });
      if (!response.ok) throw new Error(`Download server returned ${response.status}`);
      const total = Number(response.headers.get("content-length")) || 0;
      if (title) title.textContent = "Downloading GAMERZADDA…";
      if (message) message.textContent = total ? `APK size: ${bytes(total)}` : "Downloading APK (server size not provided)";
      if (!response.body || !response.body.getReader) {
        const blob = await response.blob();
        saveBlob(blob);
        return;
      }
      const reader = response.body.getReader();
      const chunks = [];
      let received = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.byteLength;
        const p = total ? Math.min(100, Math.round(received / total * 100)) : 0;
        if (fill) fill.style.width = `${p}%`;
        if (percent) percent.textContent = total ? `${p}%` : "…";
        if (sizeLabel) sizeLabel.textContent = `${bytes(received)} / ${total ? bytes(total) : "size unknown"}`;
        if (message) message.textContent = total ? `Downloading… ${p}% complete` : "Downloading APK…";
      }
      const blob = new Blob(chunks, { type: "application/vnd.android.package-archive" });
      if (fill) fill.style.width = "100%";
      if (percent) percent.textContent = "100%";
      if (sizeLabel) sizeLabel.textContent = `${bytes(received)} / ${bytes(total || received)}`;
      if (title) title.textContent = "Download ready!";
      if (message) message.textContent = "Your GAMERZADDA APK has downloaded successfully.";
      if (hint) hint.textContent = "Your browser should now save the APK file.";
      saveBlob(blob);
    } catch (err) {
      if (err.name === "AbortError") return;
      if (title) title.textContent = "Download couldn't start";
      if (message) message.textContent = "Please use the direct download button below or try again.";
      if (hint) hint.textContent = "Check your connection and try once more.";
      if (fallback) fallback.hidden = false;
      if (sizeLabel) sizeLabel.textContent = "Unable to read file size";
      console.error("GAMERZADDA APK download:", err);
    }
  }
  function saveBlob(blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gamerzadda.apk";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }
  document.querySelectorAll("[data-download]").forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();
      downloadApk();
    });
  });

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach(item => observer.observe(item));
  } else revealItems.forEach(item => item.classList.add("visible"));
})();