/** Shared navigation data loader */
window.PortfolioNav = (function () {
  let cache = null;
  return {
    load() {
      if (cache) return Promise.resolve(cache);
      return fetch("/data/navigation.json")
        .then((r) => r.json())
        .then((data) => {
          cache = data;
          return data;
        });
    },
    getSectionByCategory(data, category) {
      return data.sections.find((s) => s.category === category);
    },
    normalizePath(p) {
      if (p.endsWith("/")) return p + "index.html";
      return p;
    },
    escapeHtml(s) {
      const d = document.createElement("div");
      d.textContent = s;
      return d.innerHTML;
    },
  };
})();
