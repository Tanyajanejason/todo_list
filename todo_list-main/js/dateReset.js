// dateReset.js
// "Today only exists today." Cooking and Ateee are wiped the moment the
// wall-clock date changes. Achievements are never touched here.

function todayString() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`; // local date, not UTC
}

// Returns true if a reset happened.
function checkAndResetIfNewDay() {
  if (!Storage.getDailyResetEnabled()) return false;

  const stored = Storage.getDate();
  const today = todayString();

  if (stored === today) return false;

  Storage.setPreviousDay({
    date: stored,
    cooking: Storage.getCooking(),
    ateee: Storage.getAteee(),
  });

  Storage.setCooking([]);
  Storage.setAteee([]);
  Storage.setDate(today);
  return true;
}

// Keep checking while the tab stays open across midnight, without
// ever showing a notification or dialog about it.
function watchForDateChange(onReset) {
  setInterval(() => {
    if (checkAndResetIfNewDay()) onReset();
  }, 60 * 1000);

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      if (checkAndResetIfNewDay()) onReset();
    }
  });
}
