import { wireSaveButtons, paintSavedStates } from "../utils/savePlanButtons.js";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export class HolidaysView {
  constructor(holidaysAPI, appState, plansStorage) {
    this.holidaysAPI = holidaysAPI;
    this.appState = appState;
    this.plansStorage = plansStorage;

    this.content = document.getElementById("holidays-content");
    this.selectionBox = document.getElementById("holidays-selection");
  }

  init() {
    this.appState.subscribe((state) => this.render(state));
    this.render(this.appState);
  }

  async render(state) {
    this._renderSelectionBadge(state);

    if (!this.content) return;
    this.content.innerHTML = `<p class="status-msg">Loading holidays…</p>`;

    try {
      const holidays = await this.holidaysAPI.getPublicHolidays(state.year, state.country.code);
      this._renderHolidayCards(holidays);
    } catch (err) {
      this.content.innerHTML = `<p class="status-msg">${err.message}</p>`;
    }
  }

  _renderSelectionBadge(state) {
    if (!this.selectionBox) return;
    const flagImg = this.selectionBox.querySelector(".selection-flag");
    const spans = this.selectionBox.querySelectorAll("span");
    const nameEl = spans[0];
    const yearEl = this.selectionBox.querySelector(".selection-year");

    if (flagImg) flagImg.src = `https://flagcdn.com/w40/${state.country.code.toLowerCase()}.png`;
    if (nameEl) nameEl.textContent = state.country.name;
    if (yearEl) yearEl.textContent = state.year;
  }

  _renderHolidayCards(holidays) {
    if (!holidays.length) {
      this.content.innerHTML = `<p class="status-msg">No public holidays found for this year.</p>`;
      return;
    }

    this.content.innerHTML = holidays
      .map((h) => {
        const date = new Date(h.date);
        const day = date.getDate();
        const month = MONTHS[date.getMonth()];
        const weekday = WEEKDAYS[date.getDay()];
        const type = h.types?.[0] ?? "Public";
        const planId = `holiday-${h.date}-${h.countryCode}`;
        const plan = {
          id: planId,
          type: "holiday",
          title: h.name,
          subtitle: h.localName,
          date: h.date,
        };

        return `
          <div class="holiday-card">
            <div class="holiday-card-header">
              <div class="holiday-date-box"><span class="day">${day}</span><span class="month">${month}</span></div>
              <button class="holiday-action-btn" data-plan-id="${planId}" data-plan='${JSON.stringify(plan)}'><i class="fa-regular fa-heart"></i></button>
            </div>
            <h3>${h.name}</h3>
            <p class="holiday-name">${h.localName}</p>
            <div class="holiday-card-footer">
              <span class="holiday-day-badge"><i class="fa-regular fa-calendar"></i> ${weekday}</span>
              <span class="holiday-type-badge">${type}</span>
            </div>
          </div>`;
      })
      .join("");

    wireSaveButtons(this.content, this.plansStorage);
    paintSavedStates(this.content, this.plansStorage);
  }
}
