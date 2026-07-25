# 🌍 Wanderlust

**Your all-in-one travel companion — powered by vanilla JavaScript.**

Wanderlust is a JavaScript exam project built around a simple idea: pick a
destination once, and let every tool in the app — holidays, weather, events,
currency, sun times — react to that single choice automatically.

---

## ✨ Features

| View | What it does |
|---|---|
| 🏠 **Dashboard** | Pick a country, city & year — see live population, area, currency, languages, neighbors, calling code, and local time |
| 📅 **Holidays** | Full list of official public holidays for the selected country & year |
| 🏖️ **Long Weekends** | Auto-detected holiday + weekend combos, with a visual day-by-day breakdown |
| ⛅ **Weather** | Current conditions, hourly forecast, and a 7-day outlook |
| 🎟️ **Events** | Live concerts, sports, and shows happening in your chosen city |
| 💱 **Currency** | Convert between 160+ currencies with live exchange rates |
| ☀️ **Sun Times** | Sunrise, sunset, solar noon & daylight length for your destination |
| ❤️ **My Plans** | Save any holiday, event, or long weekend locally and manage them from one place |

---

## 🏗️ Architecture

- **Object-Oriented JavaScript** — every feature is a class with a single responsibility (`CountriesAPI`, `DashboardView`, `PlansStorage`, ...)
- **ES Modules** — each class lives in its own file, imported where it's needed
- **Observer Pattern (`AppState`)** — the Dashboard's selection is the single source of truth; every other view *subscribes* to it and re-renders automatically the moment it changes
- **Client-side Routing** — clean URLs (`/holidays`, `/weather`, `/currency`...) via the History API, with full back/forward support and no page reloads
- **`localStorage`** — saved plans persist across sessions with no backend required

- src/js/
├── api/ → one class per external API (fetch logic only)
├── models/ → Country.js (wraps raw API data into clean objects)
├── state/ → AppState.js (shared reactive state)
├── views/ → one class per screen (DOM rendering + interactions)
├── storage/ → PlansStorage.js (localStorage CRUD)
├── utils/ → small shared helpers (clock, weather-code mapping, save-button wiring)
└── main.js → wires every class together and boots the app

---

## 🔌 APIs Used

| API | Used for |
|---|---|
| [REST Countries](https://restcountries.com) | Country details (population, currency, languages, borders...) |
| [Nager.Date](https://date.nager.at) | Public holidays & long weekends |
| [Open-Meteo](https://open-meteo.com) | Weather forecasts & city geocoding |
| [Ticketmaster Discovery API](https://developer.ticketmaster.com) | Local events |
| [ExchangeRate-API](https://www.exchangerate-api.com) | Live currency conversion |
| [sunrise-sunset.org](https://sunrise-sunset.org) | Sunrise/sunset & daylight data |
| [FlagCDN](https://flagcdn.com) | Country flag images |

---

## 🚀 Live Demo

🔗 [View it live](Add your GitHub Pages link here)

---

## 🛠️ Built With

`HTML5` · `CSS3` · `JavaScript (ES2022+)` · `Bootstrap`

No frameworks, no build tools — just the browser and the DOM.

---

## 📌 What I Learned

- Structuring a mid-size vanilla JS app with OOP instead of one giant script
- Implementing the Observer pattern from scratch to keep multiple views in sync
- Working with 7 different third-party REST APIs (auth headers, query params, rate limits, and mismatched response shapes)
- Client-side routing without any library

---

## 👤 Author

**Kareem Hazem**
[GitHub](https://github.com/kareemhazem363)
