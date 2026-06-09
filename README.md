# DSE Tracker

A zero-install, single-file time tracker for Dedicated Support Engineers (or anyone who tracks time across multiple customers).

**[Open the app →](https://kmccririe.github.io/dse-tracker)**

---

## Features

- **Multiple customers** — add any number of customers, each with a custom name and color
- **Three work categories** — Case Work, Upgrade/Planning, Customer Meeting
- **DSE Update feed** — paste your daily Slack updates to build a per-customer profile
- **Timeline chart** — stacked bar chart of hours by day (last 30 days)
- **Undo** — up to 20 steps, Cmd/Ctrl+Z
- **Edit & add time** — inline edit or add time to any existing entry
- **Weekly export** — download a plain-text weekly summary per customer
- **CSV export** — full time log as CSV
- **Profile sync** — link a local `.md` file per customer (Chrome/Edge); auto-updated on every save
- **All data local** — everything stored in `localStorage`, nothing sent to a server

---

## Usage

### Open locally
```
open index.html   # macOS
```
Or just double-click `index.html`. Works in any modern browser. Chrome/Edge required for the profile file sync feature.

### Host on GitHub Pages
1. Fork or push this repo to GitHub
2. Go to **Settings → Pages → Source: main branch / root**
3. Share the resulting `https://your-username.github.io/dse-tracker` URL

---

## Getting started

1. Open the app — you'll see two sample customers ("Customer A" and "Customer B")
2. Click **⚙ Customers** in the header to rename them or add your own
3. Select a customer with the pill switcher in the header
4. Use **DSE Update** (left panel) to paste and save daily updates to the profile feed
5. Use **Log Time** (left panel) to record hours by category
6. View charts and summaries in the **Overview** tab
7. Export weekly summaries from the **By Week** tab

---

## Data & privacy

All data is stored in your browser's `localStorage` — it never leaves your machine. There is no backend, no account, and no tracking.

To back up your data: open DevTools → Application → Local Storage → copy the `dse_entries_v2` and `dse_updates_v2` values.

---

## Example profile

See [`example-profile.md`](example-profile.md) for what a linked customer profile document looks like after a week of updates.

---

## License

MIT
