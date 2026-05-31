/** Collapsible docs sidebar from navigation.json */
(function () {
  const sidebarEl = document.getElementById("site-sidebar");
  if (!sidebarEl) return;

  const currentPath = PortfolioNav.normalizePath(window.location.pathname);
  const STORAGE_KEY = "portfolio-sidebar-sections";

  PortfolioNav.load().then(render).catch(console.error);

  function render(data) {
    const expanded = getExpandedState(data);
    const parts = [
      '<div class="sidebar-brand">',
      `<a href="${window.BASE_PATH}index.html">${PortfolioNav.escapeHtml(data.siteTitle)}</a>`,
      '<span class="sidebar-tagline">Work topics</span>',
      "</div>",
      '<nav class="sidebar-tree" aria-label="Topics">',
    ];

    data.sections.forEach((section, idx) => {
      const sectionId = `sec-${idx}`;
      const isOpen = expanded.has(sectionId);
      const hasActive = section.items.some((it) => itemIsActive(it.path));

      parts.push(`<div class="tree-section${isOpen || hasActive ? " open" : ""}" data-section-id="${sectionId}">`);
      parts.push(
        `<button type="button" class="tree-section-toggle" aria-expanded="${isOpen || hasActive}">` +
          `<span class="tree-chevron" aria-hidden="true"></span>` +
          `<span class="tree-section-label">${PortfolioNav.escapeHtml(shortSection(section.title))}</span>` +
          `</button>`
      );
      parts.push('<ul class="tree-items">');
      section.items.forEach((item) => {
        const active = itemIsActive(item.path);
        parts.push(
          `<li><a href="${item.path}" class="${active ? "active" : ""}">${PortfolioNav.escapeHtml(item.navTitle || item.title)}</a></li>`
        );
      });
      parts.push("</ul></div>");
    });

    parts.push("</nav>");
    parts.push(
      '<div class="sidebar-footer">' +
        '<a href="https://github.com/anubhav3008/resume/blob/main/resume.md" target="_blank" rel="noopener">Resume ↗</a>' +
        `<a href="${window.BASE_PATH}work/youtube.html">YouTube</a>` +
        '<a href="https://github.com/anshriva" target="_blank" rel="noopener">GitHub ↗</a>' +
        '<a href="https://www.linkedin.com/in/anubhavsri" target="_blank" rel="noopener">LinkedIn ↗</a>' +
        "</div>"
    );

    sidebarEl.innerHTML = parts.join("");
    bindToggles();
  }

  function itemIsActive(itemPath) {
    const page = PortfolioNav.normalizePath(window.location.pathname);
    const base = PortfolioNav.normalizePath(itemPath.split("#")[0]);
    if (itemPath.includes("#")) {
      const hash = "#" + itemPath.split("#")[1];
      return page === base && window.location.hash === hash;
    }
    return page === base && !window.location.hash;
  }

  function shortSection(title) {
    return title
      .replace(" · Notifications Platform", "")
      .replace(" · Graph Connectors", "")
      .replace(" · YouTube", "");
  }

  function getExpandedState(data) {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    const set = new Set(saved ? JSON.parse(saved) : []);
    data.sections.forEach((section, idx) => {
      if (section.items.some((it) => itemIsActive(it.path))) {
        set.add(`sec-${idx}`);
      }
    });
    return set;
  }

  function bindToggles() {
    sidebarEl.querySelectorAll(".tree-section-toggle").forEach((btn) => {
      btn.addEventListener("click", () => {
        const section = btn.closest(".tree-section");
        section.classList.toggle("open");
        btn.setAttribute("aria-expanded", section.classList.contains("open"));
        const open = [...sidebarEl.querySelectorAll(".tree-section.open")].map(
          (el) => el.dataset.sectionId
        );
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(open));
      });
    });
  }
})();
