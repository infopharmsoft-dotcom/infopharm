const ThemeManager = {
  init() {
    const theme = localStorage.getItem("theme") || "light";
    const fontSize = localStorage.getItem("fontSize") || "16";

    // دارك مود
    if (theme === "dark") {
      document.body.classList.add("dark");
      this.updateButton(true);
    }

    // حجم الخط
    document.documentElement.style.fontSize = fontSize + "px";
  },

  toggleTheme() {
    const isDark = document.body.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    this.updateButton(isDark);
  },

  updateButton(isDark) {
    const btn = document.getElementById("darkBtn");
    if (!btn) return;
    btn.innerHTML = isDark ? "☀️ الوضع النهاري" : "🌙 الوضع الليلي";
  },

  setFontSize(size) {
    document.documentElement.style.fontSize = size + "px";
    localStorage.setItem("fontSize", size);
  }
};
function openSettings() {
  document.getElementById("settingsPanel").style.display = "block";
  document.getElementById("darkToggle").checked =
    document.body.classList.contains("dark");
}

function closeSettings() {
  document.getElementById("settingsPanel").style.display = "none";
}
