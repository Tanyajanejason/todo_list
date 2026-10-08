// storage.js
// Tiny wrapper around localStorage. Keeps every other file free of
// JSON.parse/stringify noise and gives us one place to change the
// storage strategy later if needed.

const STORAGE_KEYS = {
  date: "lb_date",
  cooking: "lb_cooking",
  ateee: "lb_ateee",
  achievements: "lb_achievements",
  dailyResetEnabled: "lb_daily_reset_enabled",
  previousDay: "lb_previous_day",
};

const Storage = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      // localStorage full or unavailable - fail silently,
      // the app should never interrupt the user with an error dialog.
    }
  },

  getDate() {
    return this.get(STORAGE_KEYS.date, null);
  },
  setDate(dateStr) {
    this.set(STORAGE_KEYS.date, dateStr);
  },

  getCooking() {
    return this.get(STORAGE_KEYS.cooking, []);
  },
  setCooking(list) {
    this.set(STORAGE_KEYS.cooking, list);
  },

  getAteee() {
    return this.get(STORAGE_KEYS.ateee, []);
  },
  setAteee(list) {
    this.set(STORAGE_KEYS.ateee, list);
  },

  getAchievements() {
    return this.get(STORAGE_KEYS.achievements, []);
  },
  setAchievements(list) {
    this.set(STORAGE_KEYS.achievements, list);
  },

  // Defaults to on - "today only exists today" is the default philosophy,
  // but the person can switch it off if they want Cooking/Ateee to persist.
  getDailyResetEnabled() {
    return this.get(STORAGE_KEYS.dailyResetEnabled, true);
  },
  setDailyResetEnabled(enabled) {
    this.set(STORAGE_KEYS.dailyResetEnabled, enabled);
  },

  // A one-slot backup of whatever was in Cooking/Ateee right before the
  // last reset wiped them - lets someone recover if they forgot to turn
  // daily reset off in time.
  getPreviousDay() {
    return this.get(STORAGE_KEYS.previousDay, null);
  },
  setPreviousDay(snapshot) {
    this.set(STORAGE_KEYS.previousDay, snapshot);
  },
};
