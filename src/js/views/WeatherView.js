import { describeWeatherCode } from "../utils/weatherCodes.js";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export class WeatherView {
  constructor(weatherAPI, appState) {
    this.weatherAPI = weatherAPI;
    this.appState = appState;

    this.section = document.getElementById("weather-view");
    this.content = document.getElementById("weather-content");
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
      const data = await this.weatherAPI.getForecast(latitude, longitude);
      this._renderHero(data, state.city || state.country.name);
      this._renderDetails(data);
      this._renderHourly(data);
      this._renderDaily(data);
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

  _renderHero(data, cityName) {
    const hero = this.content.querySelector(".weather-hero-card");
    const current = data.current;
    const today = data.daily;
    const info = describeWeatherCode(current.weather_code);

    hero.className = `weather-hero-card ${info.theme}`;
    hero.querySelector(".weather-location span:not(.weather-time)").textContent = cityName;
    hero.querySelector(".weather-time").textContent = new Date(current.time).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    hero.querySelector(".weather-hero-icon").innerHTML = `<i class="fa-solid ${info.icon}"></i>`;
    hero.querySelector(".temp-value").textContent = Math.round(current.temperature_2m);
    hero.querySelector(".weather-condition").textContent = info.text;
    hero.querySelector(".weather-feels").textContent = `Feels like ${Math.round(current.apparent_temperature)}°C`;
    hero.querySelector(".high").innerHTML = `<i class="fa-solid fa-arrow-up"></i> ${Math.round(today.temperature_2m_max[0])}°`;
    hero.querySelector(".low").innerHTML = `<i class="fa-solid fa-arrow-down"></i> ${Math.round(today.temperature_2m_min[0])}°`;
  }

  _renderDetails(data) {
    const cards = this.content.querySelectorAll(".weather-detail-card .detail-value");
    const current = data.current;
    const precipToday = data.daily.precipitation_probability_max?.[0] ?? 0;

    const values = [`${Math.round(current.relative_humidity_2m)}%`, `${Math.round(current.wind_speed_10m)} km/h`, Math.round(current.uv_index), `${precipToday}%`];
    values.forEach((val, i) => {
      if (cards[i]) cards[i].textContent = val;
    });
  }

  _renderHourly(data) {
    const scroll = this.content.querySelector(".hourly-scroll");
    if (!scroll) return;

    const nowHour = new Date(data.current.time).getHours();
    const times = data.hourly.time;
    const startIndex = times.findIndex((t) => new Date(t).getHours() === nowHour && new Date(t).getDate() === new Date(data.current.time).getDate());
    const slice = times.slice(Math.max(startIndex, 0), Math.max(startIndex, 0) + 8);

    scroll.innerHTML = slice
      .map((time, i) => {
        const idx = Math.max(startIndex, 0) + i;
        const info = describeWeatherCode(data.hourly.weather_code[idx]);
        const label = i === 0 ? "Now" : new Date(time).toLocaleTimeString("en-US", { hour: "numeric" });
        return `
          <div class="hourly-item${i === 0 ? " now" : ""}">
            <span class="hourly-time">${label}</span>
            <div class="hourly-icon"><i class="fa-solid ${info.icon}"></i></div>
            <span class="hourly-temp">${Math.round(data.hourly.temperature_2m[idx])}°</span>
          </div>`;
      })
      .join("");
  }

  _renderDaily(data) {
    const list = this.content.querySelector(".forecast-list");
    if (!list) return;

    const { time, weather_code, temperature_2m_max, temperature_2m_min, precipitation_probability_max } = data.daily;

    list.innerHTML = time
      .map((dateStr, i) => {
        const date = new Date(dateStr);
        const info = describeWeatherCode(weather_code[i]);
        const dayLabel = i === 0 ? "Today" : WEEKDAYS[date.getDay()];
        const precip = precipitation_probability_max?.[i] ?? 0;

        return `
          <div class="forecast-day${i === 0 ? " today" : ""}">
            <div class="forecast-day-name"><span class="day-label">${dayLabel}</span><span class="day-date">${date.getDate()} ${MONTHS[date.getMonth()]}</span></div>
            <div class="forecast-icon"><i class="fa-solid ${info.icon}"></i></div>
            <div class="forecast-temps"><span class="temp-max">${Math.round(temperature_2m_max[i])}°</span><span class="temp-min">${Math.round(temperature_2m_min[i])}°</span></div>
            <div class="forecast-precip">${precip > 0 ? `<i class="fa-solid fa-droplet"></i><span>${precip}%</span>` : ""}</div>
          </div>`;
      })
      .join("");
  }
}
