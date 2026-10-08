# LemonBiscuit

A quiet, guilt-free space for today's intentions. No accounts, no backend,
no build step — just open `index.html`.

## Running it

Just double-click `index.html`, or serve the folder with anything simple:

```
python3 -m http.server 8000
```

then visit `http://localhost:8000`.

## How it works

- **Cooking** — things you're doing today. **Ateee** — things you've
  finished today. They sit side by side as two columns (stacked on
  narrow/mobile screens).
- Type into the box at the top and press **Enter** to add a task to Cooking.
- Hover a task to reveal a small **⋯** menu:
  - Cooking: Rename, Move to Ateee, Delete
  - Ateee: Rename, Add/Added to achievements, Move back to Cooking, Delete
- Adding a task to achievements doesn't remove it from Ateee — it stays,
  and its text turns from grey to white so you can see at a glance what's
  been kept as a memory. "Added to achievements" toggles it back off.
- **Ctrl+Z** (Cmd+Z on Mac) undoes the last change — adding, deleting,
  renaming, moving, or marking something as an achievement. It won't reach
  back across a day's reset, and it stays out of the way of normal text
  editing while a field is focused.
- The tiny **`^_^`** button in the bottom-right opens the Achievements page,
  a separate, permanent memory archive. Achievements can only be deleted
  from that page — a deliberate act, not an accidental swipe.
- The **`:)`** button in the top-left opens a small dropdown menu with:
  - **daily reset: on/off** — off means Cooking and Ateee stop wiping at
    midnight and just keep accumulating. On by default, since "today only
    exists today" is the whole point, but the option's there.
  - **recover previous data** — brings back whatever was in Cooking/Ateee
    right before the last reset wiped them, in case daily reset was on
    when it wasn't wanted. Reads "nothing to recover" when there's no
    backup available.
- The header uses Google Fonts' **Bagel Fat One** (loaded via a `<link>`
  in `index.html`, so it needs a connection the first time, then caches).
- Every new day, Cooking and Ateee are wiped automatically. Nothing carries
  over, nothing is marked overdue. Achievements are never touched.

## File structure

```
lemonbiscuit/
├── index.html            today's view (Cooking + Ateee)
├── achievements.html      the memory archive
├── css/
│   └── style.css          all styling, one file, CSS variables at the top
└── js/
    ├── storage.js         localStorage read/write wrapper
    ├── dateReset.js        "today only exists today" logic
    ├── today.js            renders/drives Cooking & Ateee
    ├── achievements.js      renders the achievements page
    └── easterEgg.js        drives the ":)" settings dropdown
```

## Data

Everything lives in `localStorage` under six keys: `lb_date`, `lb_cooking`,
`lb_ateee`, `lb_achievements`, `lb_daily_reset_enabled`, `lb_previous_day`.
Nothing leaves the browser.

## Extending it

If you're tempted to add due dates, priorities, or a streak counter —
don't. That's a different app. The one rule that's kept this simple: if
removing a feature makes it feel calmer, remove it.
