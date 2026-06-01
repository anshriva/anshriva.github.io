/** Set the base path for the root domain */
(function () {
  window.BASE_PATH = '/';

  // For easier path construction
  window.getAssetPath = function(path) {
    if (path.startsWith('/')) {
      path = path.slice(1);
    }
    return window.BASE_PATH + path;
  };
})();
