import { Country } from "../models/Country.js";

export class DashboardView {
  constructor(countriesAPI, holidaysAPI, plansStorage, appState) {
    this.countriesAPI = countriesAPI;
    this.holidaysAPI = holidaysAPI;
    this.plansStorage = plansStorage;
    this.appState = appState;

    this.countrySelect = document.getElementById("global-country");
    this.citySelect = document.getElementById("global-city");
    this.yearSelect = document.getElementById("global-year");
    this.searchBtn = document.getElementById("global-search-btn");
    this.clearBtn = document.getElementById("clear-selection-btn");

    this.selectedDestination = document.getElementById("selected-destination");
    this.selectedFlag = document.getElementById("selected-country-flag");
    this.selectedName = document.getElementById("selected-country-name");
    this.selectedCity = document.getElementById("selected-city-name");

    this.countryInfoBox = document.getElementById("dashboard-country-info");
    this.localTimeEl = document.getElementById("country-local-time");

    this.statCountries = document.getElementById("stat-countries");
    this.statHolidays = document.getElementById("stat-holidays");
    this.statSaved = document.getElementById("stat-saved");
    this.plansBadge = document.getElementById("plans-count");

    this.countries = [];
    this._clockInterval = null;
    this._lastDetails = null; 
  }

  async init() {
    this._renderSavedPlansCount();
    this.plansStorage.subscribe(() => this._renderSavedPlansCount());
    await this._loadCountries();

    this.searchBtn.addEventListener("click", () => this.explore());
    if (this.clearBtn) {
      this.clearBtn.addEventListener("click", () => this._clearSelection());
    }
    this.countrySelect.addEventListener("change", () => this._onCountryChange());

    // Load whichever country is selected by default (Egypt) right away
    await this._onCountryChange();
    await this.explore();
  }

  _renderSavedPlansCount() {
    const count = this.plansStorage.count();
    this.statSaved.textContent = count;
    if (this.plansBadge) {
      this.plansBadge.textContent = count;
      this.plansBadge.classList.toggle("hidden", count === 0);
    }
  }

 async _loadCountries() {
    this.countries = await this.countriesAPI.getAllCountries();
    this.countries.sort((a, b) => a.name.localeCompare(b.name));

    this.statCountries.textContent = `${this.countries.length}+`;

    const currentValue = this.countrySelect.value || "EG";
    this.countrySelect.innerHTML = "";
    this.countries.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c.countryCode;
      
      const emoji = this._flagEmoji(c.countryCode);
      opt.textContent = `${emoji} ${c.name}`;
      
      if (c.countryCode === currentValue) opt.selected = true;
      this.countrySelect.appendChild(opt);
    });
  }
  // Converts a 2-letter country code (e.g. "EG") into its flag emoji 
  _flagEmoji(countryCode) {
    if (!countryCode || countryCode.length !== 2) return "";
    const codePoints = [...countryCode.toUpperCase()].map(
      (char) => 0x1f1e6 + (char.charCodeAt(0) - 65)
    );
    return String.fromCodePoint(...codePoints);
  }

  async _onCountryChange() {
    const select = this.countrySelect;
    const rawText = select.options[select.selectedIndex]?.text ?? "";
    const name = rawText.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, "").trim();
    
    this.citySelect.innerHTML = "";
    try {
      const details = await this.countriesAPI.getCountryDetails(name);
      if (!details) return;
      const country = new Country(details, select.value);
      
      if (country.capital && country.capital !== "—") {
        const opt = document.createElement("option");
        opt.value = country.capital;
        opt.textContent = country.capital;
        opt.selected = true;
        this.citySelect.appendChild(opt);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async explore() {
    const code = this.countrySelect.value;
    const rawText = this.countrySelect.options[this.countrySelect.selectedIndex]?.text ?? "";
    const name = rawText.replace(/^\S+\s/, "").trim();
    const year = this.yearSelect.value;
    const city = this.citySelect.value;
    if (!code || !year) return;

    try {
      const detailsPromise =
        this._lastDetails && this._lastDetails.name === name
          ? Promise.resolve(this._lastDetails.data)
          : this.countriesAPI.getCountryDetails(name);

      const [rawDetails, holidays] = await Promise.all([
        detailsPromise,
        this.holidaysAPI.getPublicHolidays(year, code),
      ]);

      const country = new Country(rawDetails, code);
      this.statHolidays.textContent = holidays.length;

      this._renderSelectedDestination(country, city);
      this.displayCountryInfo(country);

      this.appState.update({
        country: { code: country.code, name: country.name },
        city: city || country.capital,
        year: Number(year),
      });
    } catch (err) {
      console.error(err);
    }
  }

  _renderSelectedDestination(country, city) {
    this.selectedFlag.src = `https://flagcdn.com/w80/${country.code ? country.code.toLowerCase() : 'eg'}.png`;
    this.selectedFlag.alt = country.name;
    this.selectedName.textContent = country.name;
    this.selectedCity.textContent = `• ${city || country.capital}`;
    this.selectedDestination.classList.remove("hidden");
  }
  displayCountryInfo(country) {
    const flagEl = this.countryInfoBox.querySelector(".dashboard-country-flag");
    const nameEl = this.countryInfoBox.querySelector(".dashboard-country-title h3");
    const officialEl = this.countryInfoBox.querySelector(".official-name");
    const regionEl = this.countryInfoBox.querySelector(".region");

    flagEl.src = country.flag;
    flagEl.alt = country.name;
    nameEl.textContent = country.name;
    officialEl.textContent = country.officialName;
    regionEl.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${country.continent}${
      country.subregion ? " • " + country.subregion : ""
    }`;
    const values = this.countryInfoBox.querySelectorAll(".dashboard-country-detail .value");
    const filled = [
      country.capital,
      country.formattedPopulation,
      country.formattedArea,
      country.continent,
      country.callingCode,
      country.drivingSide === "right" ? "Right" : country.drivingSide === "left" ? "Left" : "—",
    ];
    filled.forEach((val, i) => {
      if (values[i]) values[i].textContent = val;
    });
    // values[6] (Week Starts) has no API source, so it is left untouched.

    const extrasBlocks = this.countryInfoBox.querySelectorAll(".dashboard-country-extra .extra-tags");
    // Currency
    if (extrasBlocks[0]) {
      extrasBlocks[0].innerHTML = `<span class="extra-tag">${country.currency} (${country.currencySymbol})</span>`;
    }
    // Languages
    if (extrasBlocks[1]) {
      extrasBlocks[1].innerHTML = country.languages
        .map((lang) => `<span class="extra-tag">${lang}</span>`)
        .join("");
    }
    // Neighbors
    if (extrasBlocks[2]) {
      extrasBlocks[2].innerHTML = country.borders.length
        ? country.borders.map((code) => `<span class="extra-tag border-tag">${code}</span>`).join("")
        : `<span class="extra-tag">No land borders</span>`;
    }

    const mapLink = this.countryInfoBox.querySelector(".btn-map-link");
    if (mapLink) mapLink.href = `https://www.google.com/maps/place/${encodeURIComponent(country.name)}`;

    this._startClock(country);
  }

  _startClock(country) {
    if (this._clockInterval) clearInterval(this._clockInterval);

    const tick = () => {
      const nowUtc = Date.now() + new Date().getTimezoneOffset() * 60000;
      const local = new Date(nowUtc + country.utcOffsetMinutes * 60000);
      this.localTimeEl.textContent = local.toLocaleTimeString("en-US");
      const zoneEl = this.localTimeEl.nextElementSibling;
      if (zoneEl) zoneEl.textContent = country.timezone;
    };

    tick();
    this._clockInterval = setInterval(tick, 1000);
  }

  _clearSelection() {
    this.selectedDestination.classList.add("hidden");
    if (this._clockInterval) clearInterval(this._clockInterval);
  }
}