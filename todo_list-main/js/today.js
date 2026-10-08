// today.js
// Renders and drives the Cooking / Ateee lists on index.html.
//
// Interactions:
//   - type + Enter into the input             -> new task in Cooking
//   - each task has a "⋯" menu, visible on hover, with:
//     Cooking:  Rename, Move to Ateee, Delete
//     Ateee:    Rename, Add/Added to achievements, Move back to Cooking, Delete
//   - adding a task to achievements keeps it in Ateee, just turns its text
//     white (unmarked Ateee tasks stay grey) and gives a brief ✓ pulse

let cooking = [];
let ateee = [];

const undoStack = [];
const MAX_UNDO = 50;

function pushHistory() {
  undoStack.push({
    cooking: JSON.parse(JSON.stringify(cooking)),
    ateee: JSON.parse(JSON.stringify(ateee)),
    achievements: JSON.parse(JSON.stringify(Storage.getAchievements())),
  });
  if (undoStack.length > MAX_UNDO) undoStack.shift();
}

function undo() {
  const prev = undoStack.pop();
  if (!prev) return;
  cooking = prev.cooking;
  ateee = prev.ateee;
  saveState();
  Storage.setAchievements(prev.achievements);
  render();
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function loadState() {
  cooking = Storage.getCooking();
  ateee = Storage.getAteee();
}

function saveState() {
  Storage.setCooking(cooking);
  Storage.setAteee(ateee);
}

function addTask(text) {
  const trimmed = text.trim();
  if (!trimmed) return;
  pushHistory();
  cooking.push({ id: uid(), text: trimmed });
  saveState();
  render();
}

function completeTask(id) {
  const idx = cooking.findIndex((t) => t.id === id);
  if (idx === -1) return;
  pushHistory();
  const [task] = cooking.splice(idx, 1);
  ateee.push(task);
  saveState();
  render();
}

function undoTask(id) {
  const idx = ateee.findIndex((t) => t.id === id);
  if (idx === -1) return;
  pushHistory();
  const [task] = ateee.splice(idx, 1);
  cooking.push(task);
  saveState();
  render();
}

function deleteFromCooking(id) {
  pushHistory();
  cooking = cooking.filter((t) => t.id !== id);
  saveState();
  render();
}

function deleteFromAteee(id) {
  pushHistory();
  ateee = ateee.filter((t) => t.id !== id);
  saveState();
  render();
}

function renameCooking(id, newText) {
  const trimmed = newText.trim();
  if (!trimmed) return;
  const task = cooking.find((t) => t.id === id);
  if (!task) return;
  pushHistory();
  task.text = trimmed;
  saveState();
  render();
}

function renameAteee(id, newText) {
  const trimmed = newText.trim();
  if (!trimmed) return;
  const task = ateee.find((t) => t.id === id);
  if (!task) return;
  pushHistory();
  task.text = trimmed;
  saveState();
  render();
}

function toggleAchievement(id, li) {
  const task = ateee.find((t) => t.id === id);
  if (!task) return;
  pushHistory();

  if (!task.achieved) {
    const achievementId = uid();
    const achievements = Storage.getAchievements();
    achievements.push({ id: achievementId, text: task.text, date: todayString() });
    Storage.setAchievements(achievements);

    task.achieved = true;
    task.achievementId = achievementId;
    saveState();
    render();

    // small satisfying, non-destructive feedback - the task stays put
    const freshLi = document.querySelector(`.item[data-id="${id}"]`);
    if (freshLi) {
      const check = document.createElement("span");
      check.className = "item-checkmark";
      check.textContent = "✓";
      check.setAttribute("aria-hidden", "true");
      freshLi.appendChild(check);
      freshLi.classList.add("confirm-pulse");
      setTimeout(() => check.remove(), 900);
    }
  } else {
    const achievements = Storage.getAchievements().filter(
      (a) => a.id !== task.achievementId
    );
    Storage.setAchievements(achievements);

    task.achieved = false;
    delete task.achievementId;
    saveState();
    render();
  }
}

function recoverPreviousDay() {
  const prev = Storage.getPreviousDay();
  if (!prev) return false;
  const prevCooking = prev.cooking || [];
  const prevAteee = prev.ateee || [];
  if (prevCooking.length === 0 && prevAteee.length === 0) return false;

  pushHistory();
  prevCooking.forEach((t) => cooking.push({ ...t, id: uid() }));
  prevAteee.forEach((t) => ateee.push({ ...t, id: uid() }));
  saveState();
  render();
  return true;
}

function startRename(li, span, text, onRename) {
  const input = document.createElement("input");
  input.className = "item-rename-input";
  input.type = "text";
  input.value = text;
  input.maxLength = 280;

  span.replaceWith(input);
  input.focus();
  input.setSelectionRange(input.value.length, input.value.length);

  let settled = false;
  const commit = () => {
    if (settled) return;
    settled = true;
    onRename(input.value);
  };
  const cancel = () => {
    if (settled) return;
    settled = true;
    render();
  };

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") commit();
    if (e.key === "Escape") cancel();
  });
  input.addEventListener("blur", commit);
}

function closeAllMenus(except) {
  document.querySelectorAll(".item-menu-wrap.open").forEach((wrap) => {
    if (wrap !== except) wrap.classList.remove("open");
  });
}

function makeItem(task, opts) {
  const { id, text, achieved } = task;
  const { done, onMove, onDelete, onRename, onToggleAchievement, moveLabel } = opts;

  const li = document.createElement("li");
  li.className = "item" + (done ? " done" : "") + (achieved ? " achieved" : "");
  li.dataset.id = id;

  const bullet = document.createElement("span");
  bullet.className = "item-bullet";
  bullet.textContent = "•";
  bullet.setAttribute("aria-hidden", "true");
  li.appendChild(bullet);

  const span = document.createElement("span");
  span.className = "item-text";
  span.textContent = text;
  li.appendChild(span);

  const menuWrap = document.createElement("div");
  menuWrap.className = "item-menu-wrap";

  const trigger = document.createElement("button");
  trigger.className = "item-menu-trigger";
  trigger.setAttribute("aria-label", "Task options");
  trigger.setAttribute("aria-haspopup", "true");
  trigger.textContent = "⋯";
  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = menuWrap.classList.contains("open");
    closeAllMenus();
    if (!isOpen) menuWrap.classList.add("open");
  });
  menuWrap.appendChild(trigger);

  const menu = document.createElement("div");
  menu.className = "item-menu";
  menu.setAttribute("role", "menu");

  const addMenuItem = (label, handler, opts = {}) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = label;
    if (opts.destructive) btn.classList.add("destructive");
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      menuWrap.classList.remove("open");
      handler();
    });
    menu.appendChild(btn);
  };

  addMenuItem("Rename", () => {
    startRename(li, span, text, (newText) => onRename(id, newText));
  });

  if (onToggleAchievement) {
    addMenuItem(
      achieved ? "Added to achievements" : "Add to achievements",
      () => onToggleAchievement(id, li)
    );
  }

  addMenuItem(moveLabel.text, () => onMove(id));
  addMenuItem("Delete", () => onDelete(id), { destructive: true });

  menuWrap.appendChild(menu);
  li.appendChild(menuWrap);

  return li;
}

document.addEventListener("click", () => closeAllMenus());
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeAllMenus();

  const key = e.key.toLowerCase();
  if ((e.ctrlKey || e.metaKey) && key === "z" && !e.shiftKey) {
    const activeTag = document.activeElement && document.activeElement.tagName;
    // let the browser's native undo handle text still being typed/edited
    if (activeTag === "INPUT" || activeTag === "TEXTAREA") return;
    e.preventDefault();
    undo();
  }
});

function render() {
  const cookingList = document.getElementById("cooking-list");
  const ateeeList = document.getElementById("ateee-list");

  cookingList.innerHTML = "";
  if (cooking.length === 0) {
    cookingList.appendChild(emptyHint("nothing cooking yet"));
  } else {
    cooking.forEach((task) => {
      cookingList.appendChild(
        makeItem(task, {
          done: false,
          onMove: completeTask,
          onDelete: deleteFromCooking,
          onRename: renameCooking,
          moveLabel: { text: "Move to Ateee" },
        })
      );
    });
  }

  // Ateee keeps a small, quiet hint when there's nothing there yet.
  ateeeList.innerHTML = "";
  if (ateee.length === 0) {
    ateeeList.appendChild(emptyHint("nothing yet"));
  } else {
    ateee.forEach((task) => {
      ateeeList.appendChild(
        makeItem(task, {
          done: true,
          onMove: undoTask,
          onDelete: deleteFromAteee,
          onRename: renameAteee,
          onToggleAchievement: toggleAchievement,
          moveLabel: { text: "Move back to Cooking" },
        })
      );
    });
  }
}

function emptyHint(text) {
  const div = document.createElement("div");
  div.className = "empty-hint";
  div.textContent = text;
  return div;
}

function initToday() {
  checkAndResetIfNewDay();
  loadState();
  render();

  const input = document.getElementById("task-input");
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      addTask(input.value);
      input.value = "";
    }
  });

  watchForDateChange(() => {
    undoStack.length = 0;
    loadState();
    render();
  });
}

document.addEventListener("DOMContentLoaded", initToday);
