import { wireSaveButtons, paintSavedStates } from "../utils/savePlanButtons.js";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export class LongWeekendsView {
  constructor(holidaysAPI, appState, plansStorage) {
    this.holidaysAPI = holidaysAPI;
    this.appState = appState;
    this.plansStorage = plansStorage;

    this.content = document.getElementById("lw-content");
    this.selectionBox = document.querySelector("#long-weekends-view .current-selection-badge");
  }

  init() {
    this.appState.subscribe((state) => this.render(state));
    this.render(this.appState);
  }

  async render(state) {
    this._renderSelectionBadge(state);

    if (!this.content) return;
    this.content.innerHTML = `<p class="status-msg">Loading long weekends…</p>`;

    try {
      const weekends = await this.holidaysAPI.getLongWeekends(state.year, state.country.code);
      this._renderCards(weekends);
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

  _renderCards(weekends) {
    if (!weekends.length) {
      this.content.innerHTML = `<p class="status-msg">No long weekends found for this year.</p>`;
      return;
    }

    this.content.innerHTML = weekends
      .map((w, i) => {
        const start = new Date(w.startDate);
        const end = new Date(w.endDate);

        const dateLabel = `${MONTHS[start.getMonth()]} ${start.getDate()} - ${MONTHS[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`;
        const planId = `lw-${w.startDate}-${w.endDate}`;
        const plan = {
          id: planId,
          type: "longweekend",
          title: `Long Weekend #${i + 1}`,
          subtitle: dateLabel,
          date: w.startDate,
        };

        const infoBox = w.needBridgeDay
          ? `<div class="lw-info-box warning"><i class="fa-solid fa-info-circle"></i> Requires taking a bridge day off</div>`
          : `<div class="lw-info-box success"><i class="fa-solid fa-check-circle"></i> No extra days off needed!</div>`;

        const days = [];
        const cursor = new Date(start);
        while (cursor <= end) {
          const dow = cursor.getDay();
          const isWeekend = dow === 0 || dow === 6;
          days.push(`
            <div class="lw-day${isWeekend ? " weekend" : ""}">
              <span class="name">${WEEKDAYS[dow]}</span>
              <span class="num">${cursor.getDate()}</span>
            </div>`);
          cursor.setDate(cursor.getDate() + 1);
        }

        return `
          <div class="lw-card">
            <div class="lw-card-header">
              <span class="lw-badge"><i class="fa-solid fa-calendar-days"></i> ${w.dayCount} Days</span>
              <button class="holiday-action-btn" data-plan-id="${planId}" data-plan='${JSON.stringify(plan)}'><i class="fa-regular fa-heart"></i></button>
            </div>
            <h3>Long Weekend #${i + 1}</h3>
            <div class="lw-dates"><i class="fa-regular fa-calendar"></i> ${dateLabel}</div>
            ${infoBox}
            <div class="lw-days-visual">${days.join("")}</div>
          </div>`;
      })
      .join("");

    wireSaveButtons(this.content, this.plansStorage);
    paintSavedStates(this.content, this.plansStorage);
  }
}
