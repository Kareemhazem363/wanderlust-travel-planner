import { wireSaveButtons, paintSavedStates } from "../utils/savePlanButtons.js";

export class EventsView {
  constructor(eventsAPI, appState, plansStorage) {
    this.eventsAPI = eventsAPI;
    this.appState = appState;
    this.plansStorage = plansStorage;

    this.section = document.getElementById("events-view");
    this.content = document.getElementById("events-content");
    this.selectionBox = this.section?.querySelector(".current-selection-badge");
  }

  init() {
    this.appState.subscribe((state) => this.render(state));
    this.render(this.appState);
  }

  async render(state) {
    this._renderSelectionBadge(state);
    if (!this.content) return;

    this.content.innerHTML = `<p class="status-msg">Loading events…</p>`;

    try {
      const events = await this.eventsAPI.searchEvents(state.city, state.country.code);
      this._renderCards(events);
    } catch (err) {
      this.content.innerHTML = `<p class="status-msg">${err.message}</p>`;
    }
  }

  _renderSelectionBadge(state) {
    if (!this.selectionBox) return;
    const flagImg = this.selectionBox.querySelector(".selection-flag");
    const spans = this.selectionBox.querySelectorAll("span");
    const nameEl = spans[0];
    const cityEl = this.selectionBox.querySelector(".selection-city");

    if (flagImg) flagImg.src = `https://flagcdn.com/w40/${state.country.code.toLowerCase()}.png`;
    if (nameEl) nameEl.textContent = state.country.name;
    if (cityEl) cityEl.textContent = `• ${state.city}`;
  }

  _renderCards(events) {
    if (!events.length) {
      this.content.innerHTML = `<p class="status-msg">No events found for this city right now.</p>`;
      return;
    }

    this.content.innerHTML = events.map((event) => this._eventCard(event)).join("");
    wireSaveButtons(this.content, this.plansStorage);
    paintSavedStates(this.content, this.plansStorage);
  }

  _eventCard(event) {
    const image = event.images?.find((img) => img.width >= 400) ?? event.images?.[0];
    const imageUrl = image?.url ?? "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=200&fit=crop";

    const category = event.classifications?.[0]?.segment?.name ?? "Event";

    const date = event.dates?.start?.localDate;
    const time = event.dates?.start?.localTime;
    const dateLabel = date
      ? new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "Date TBA";
    const timeLabel = time ? ` at ${time.slice(0, 5)}` : "";

    const venue = event._embedded?.venues?.[0];
    const venueLabel = venue ? `${venue.name}, ${venue.city?.name ?? ""}` : "Venue TBA";

    const plan = {
      id: event.id,
      type: "event",
      title: event.name,
      subtitle: venueLabel,
      date: date ?? "",
      url: event.url,
    };
    const planAttr = JSON.stringify(plan);

    return `
      <div class="event-card">
        <div class="event-card-image">
          <img src="${imageUrl}" alt="${event.name}">
          <span class="event-card-category">${category}</span>
          <button class="event-card-save" data-plan-id="${event.id}" data-plan='${planAttr}'><i class="fa-regular fa-heart"></i></button>
        </div>
        <div class="event-card-body">
          <h3>${event.name}</h3>
          <div class="event-card-info">
            <div><i class="fa-regular fa-calendar"></i>${dateLabel}${timeLabel}</div>
            <div><i class="fa-solid fa-location-dot"></i>${venueLabel}</div>
          </div>
          <div class="event-card-footer">
            <button class="btn-event" data-plan-id="${event.id}" data-plan='${planAttr}'><i class="fa-regular fa-heart"></i> Save</button>
            <a href="${event.url}" target="_blank" rel="noopener" class="btn-buy-ticket"><i class="fa-solid fa-ticket"></i> Buy Tickets</a>
          </div>
        </div>
      </div>`;
  }
}
