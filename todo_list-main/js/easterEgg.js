// easterEgg.js
// A tiny "settings" menu tucked behind the ":)" button in the corner:
// a daily-reset on/off toggle and a way to recover the previous day's
// tasks in case daily reset was on when it wasn't wanted.

function initEasterEgg() {
  const wrap = document.getElementById("egg-menu-wrap");
  const btn = document.getElementById("egg-toggle");
  const resetToggle = document.getElementById("daily-reset-toggle");
  const recoverBtn = document.getElementById("recover-btn");
  if (!wrap || !btn) return;

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    wrap.classList.toggle("open");
  });

  document.addEventListener("click", () => wrap.classList.remove("open"));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") wrap.classList.remove("open");
  });

  wrap.addEventListener("click", (e) => e.stopPropagation());

  if (resetToggle) {
    const renderResetToggle = () => {
      const enabled = Storage.getDailyResetEnabled();
      resetToggle.textContent = `daily reset: ${enabled ? "on" : "off"}`;
      resetToggle.classList.toggle("off", !enabled);
    };

    resetToggle.addEventListener("click", () => {
      const enabled = Storage.getDailyResetEnabled();
      Storage.setDailyResetEnabled(!enabled);
      renderResetToggle();
    });

    renderResetToggle();
  }

  if (recoverBtn) {
    const renderRecoverBtn = () => {
      const prev = Storage.getPreviousDay();
      const hasBackup =
        prev && (((prev.cooking || []).length) || ((prev.ateee || []).length));
      recoverBtn.classList.toggle("disabled", !hasBackup);
      recoverBtn.textContent = hasBackup
        ? "recover previous data"
        : "nothing to recover";
    };

    recoverBtn.addEventListener("click", () => {
      if (recoverBtn.classList.contains("disabled")) return;
      if (typeof recoverPreviousDay === "function") {
        recoverPreviousDay();
        renderRecoverBtn();
      }
      wrap.classList.remove("open");
    });

    renderRecoverBtn();
  }
}

document.addEventListener("DOMContentLoaded", initEasterEgg);
