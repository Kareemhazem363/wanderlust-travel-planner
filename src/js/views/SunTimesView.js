// Extracts the local wall-clock time directly from an ISO string like
// "2026-01-15T08:27:43+02:00" instead of building a Date object, because
// Date/toLocaleTimeString would silently convert it to the viewer's own
// timezone instead of the destination's.
function formatIsoLocalTime(iso) {
  const match = iso.match(/T(\d{2}):(\d{2})/);
  if (!match) return "—";
  let [, hourStr, minute] = match;
  let hour = parseInt(hourStr, 10);
  const period = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${period}`;
}

// day_length may come back as "12:47:32" (HH:MM:SS) or as raw seconds
function parseDayLengthSeconds(dayLength) {
  if (typeof dayLength === "number") return dayLength;
  const parts = String(dayLength).split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

function formatHoursMinutes(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

export class SunTimesView {
  constructor(weatherAPI, sunTimesAPI, appState) {
    this.weatherAPI = weatherAPI;
    this.sunTimesAPI = sunTimesAPI;
    this.appState = appState;

    this.section = document.getElementById("sun-times-view");
    this.content = document.getElementById("sun-times-content");
    this.selectionBox = this.section?.querySelector(".current-selection-badge");
  }

  init() {
    this.appState.subscribe((state) => this.render(state));
    this.render(this.appState);
  }

  async render(state) {
    this._renderSelectionBadge(state);
    if (!this.content) return;

    try {
      const { latitude, longitude } = await this.weatherAPI.geocode(state.city || state.country.name);
      const tzid = await this.weatherAPI.getTimezone(latitude, longitude);
      const results = await this.sunTimesAPI.getSunTimes(latitude, longitude, tzid);
      this._renderSunTimes(results, state.city || state.country.name);
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

  _renderSunTimes(results, cityName) {
    const locationHeading = this.content.querySelector(".sun-location h2");
    if (locationHeading) locationHeading.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${cityName}`;

    const now = new Date();
    const dateEl = this.content.querySelector(".sun-date-display .date");
    const dayEl = this.content.querySelector(".sun-date-display .day");
    if (dateEl) dateEl.textContent = now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    if (dayEl) dayEl.textContent = now.toLocaleDateString("en-US", { weekday: "long" });

    const dawn = results.dawn ?? results.civil_twilight_begin;
    const dusk = results.dusk ?? results.civil_twilight_end;
    const daylightSeconds = parseDayLengthSeconds(results.day_length);
    const daylightLabel = formatHoursMinutes(daylightSeconds);

    const cards = this.content.querySelectorAll(".sun-time-card .time");
    const values = [
      formatIsoLocalTime(dawn),
      formatIsoLocalTime(results.sunrise),
      formatIsoLocalTime(results.solar_noon),
      formatIsoLocalTime(results.sunset),
      formatIsoLocalTime(dusk),
      daylightLabel,
    ];
    values.forEach((val, i) => {
      if (cards[i]) cards[i].textContent = val;
    });

    const daylightPercent = Math.min(100, (daylightSeconds / 86400) * 100);
    const darknessSeconds = 86400 - daylightSeconds;

    const progressFill = this.content.querySelector(".day-progress-fill");
    if (progressFill) progressFill.style.width = `${daylightPercent.toFixed(1)}%`;

    const statValues = this.content.querySelectorAll(".day-length-stats .day-stat .value");
    if (statValues[0]) statValues[0].textContent = daylightLabel;
    if (statValues[1]) statValues[1].textContent = `${daylightPercent.toFixed(1)}%`;
    if (statValues[2]) statValues[2].textContent = formatHoursMinutes(darknessSeconds);
  }
}
