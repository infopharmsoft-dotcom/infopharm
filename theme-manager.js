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
    
    // تحديث أي عناصر تعتمد على الثيم
    this.updateChartColors();
  },

  toggleTheme() {
    const isDark = document.body.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    this.updateButton(isDark);
    this.updateChartColors();
    
    // إظهار إشعار للمستخدم
    this.showToast(isDark ? "🌙 الوضع الليلي مفعل" : "☀️ الوضع النهاري مفعل");
  },

  updateButton(isDark) {
    const btn = document.getElementById("darkBtn");
    if (!btn) return;
    btn.innerHTML = isDark ? "☀️ نهاري" : "🌙 ليلي";
    btn.title = isDark ? "التبديل للوضع النهاري" : "التبديل للوضع الليلي";
  },

  setFontSize(size) {
    document.documentElement.style.fontSize = size + "px";
    localStorage.setItem("fontSize", size);
    this.showToast(`📏 تم تغيير حجم الخط إلى ${size}px`);
  },
  
  getFontSize() {
    return parseInt(localStorage.getItem("fontSize") || "16");
  },
  
  resetToDefault() {
    this.setFontSize(16);
    if (document.body.classList.contains("dark")) {
      this.toggleTheme();
    }
    this.showToast("✅ تم إعادة ضبط الإعدادات");
  },
  
  updateChartColors() {
    // تحديث ألوان الرسوم البيانية إذا وجدت
    const isDark = document.body.classList.contains("dark");
    const textColor = isDark ? "#ffffff" : "#333333";
    const bgColor = isDark ? "#1a1a2e" : "#ffffff";
    
    document.documentElement.style.setProperty('--text-color', textColor);
    document.documentElement.style.setProperty('--bg-color', bgColor);
  },
  
  showToast(msg) {
    // استخدام toast الموجود في الصفحة إن وجد
    const toast = document.getElementById("toast");
    if (toast) {
      toast.textContent = msg;
      toast.className = "toast show success";
      setTimeout(() => {
        toast.className = "toast";
      }, 2000);
    }
  }
};

// دوال الإعدادات للواجهة
function openSettings() {
  const panel = document.getElementById("settingsPanel");
  if (panel) {
    panel.style.display = "flex";
    const darkToggle = document.getElementById("darkToggle");
    if (darkToggle) {
      darkToggle.checked = document.body.classList.contains("dark");
    }
    const fontSizeSlider = document.getElementById("fontSizeSlider");
    if (fontSizeSlider) {
      fontSizeSlider.value = ThemeManager.getFontSize();
    }
  }
}

function closeSettings() {
  const panel = document.getElementById("settingsPanel");
  if (panel) {
    panel.style.display = "none";
  }
}

function toggleDarkMode() {
  ThemeManager.toggleTheme();
}

function changeFontSize(value) {
  ThemeManager.setFontSize(value);
  const fontSizeValue = document.getElementById("fontSizeValue");
  if (fontSizeValue) {
    fontSizeValue.textContent = value + "px";
  }
}

function resetSettings() {
  ThemeManager.resetToDefault();
  const fontSizeSlider = document.getElementById("fontSizeSlider");
  if (fontSizeSlider) {
    fontSizeSlider.value = 16;
  }
  const fontSizeValue = document.getElementById("fontSizeValue");
  if (fontSizeValue) {
    fontSizeValue.textContent = "16px";
  }
}

// تصدير للاستخدام العالمي
window.ThemeManager = ThemeManager;
window.openSettings = openSettings;
window.closeSettings = closeSettings;
window.toggleDarkMode = toggleDarkMode;
window.changeFontSize = changeFontSize;
window.resetSettings = resetSettings;