// Theme management
const ThemeManager = {
  storageKey: 'portfolio-theme',
  lightTheme: 'light',
  darkTheme: 'dark',

  init() {
    this.applyTheme(this.getSavedTheme() || this.lightTheme);
    this.setupToggle();
  },

  getSavedTheme() {
    return localStorage.getItem(this.storageKey);
  },

  getSystemTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return this.darkTheme;
    }
    return this.lightTheme;
  },

  applyTheme(theme) {
    if (theme === this.darkTheme) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem(this.storageKey, theme);
    this.updateToggleButton(theme);
  },

  toggleTheme() {
    const current = this.getSavedTheme() || this.lightTheme;
    const next = current === this.lightTheme ? this.darkTheme : this.lightTheme;
    this.applyTheme(next);
  },

  updateToggleButton(theme) {
    const button = document.querySelector('.theme-toggle');
    if (button) {
      button.innerHTML = theme === this.darkTheme ? '☀️' : '🌙';
      button.title = theme === this.darkTheme ? 'Switch to light mode' : 'Switch to dark mode';
    }
  },

  setupToggle() {
    const button = document.querySelector('.theme-toggle');
    if (button) {
      button.addEventListener('click', () => this.toggleTheme());
    }
  }
};

// Initialize theme when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => ThemeManager.init());
} else {
  ThemeManager.init();
}
