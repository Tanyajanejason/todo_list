// achievements.js
// The memory archive. Deliberately separate from today's flow.
// Deleting here is allowed - editing your own memory archive is a
// considered act, unlike the frictionless flow on the main page.

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function renderAchievements() {
  const list = document.getElementById("achievements-list");
  const achievements = Storage.getAchievements();
  list.innerHTML = "";

  if (achievements.length === 0) {
    const div = document.createElement("div");
    div.className = "empty-hint";
    div.textContent = "nothing saved yet";
    list.appendChild(div);
    return;
  }

  // newest first
  [...achievements].reverse().forEach((item) => {
    const row = document.createElement("li");
    row.className = "ach-item";

    const text = document.createElement("span");
    text.className = "ach-text";
    text.textContent = item.text;

    const date = document.createElement("span");
    date.className = "ach-date";
    date.textContent = formatDate(item.date);

    const del = document.createElement("button");
    del.className = "ach-delete";
    del.setAttribute("aria-label", "Remove this memory");
    del.textContent = "×";
    del.addEventListener("click", () => {
      const updated = Storage.getAchievements().filter((a) => a.id !== item.id);
      Storage.setAchievements(updated);
      renderAchievements();
    });

    row.appendChild(text);
    row.appendChild(date);
    row.appendChild(del);
    list.appendChild(row);
  });
}

document.addEventListener("DOMContentLoaded", renderAchievements);
