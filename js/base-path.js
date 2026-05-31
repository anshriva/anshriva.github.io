/** Detect and set the base path for both local and GitHub Pages environments */
(function () {
  const pathname = window.location.pathname;

  // If running on GitHub Pages at /resume/, base is /resume/
  // If running locally, base is /
  const basePath = pathname.includes('/resume/') ? '/resume/' : '/';

  window.BASE_PATH = basePath;

  // For easier path construction
  window.getAssetPath = function(path) {
    if (path.startsWith('/')) {
      path = path.slice(1);
    }
    return window.BASE_PATH + path;
  };
})();
