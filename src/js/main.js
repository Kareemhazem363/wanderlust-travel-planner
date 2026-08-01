import { CountriesAPI } from "./api/CountriesAPI.js";
import { HolidaysAPI } from "./api/HolidaysAPI.js";
import { WeatherAPI } from "./api/WeatherAPI.js";
import { EventsAPI } from "./api/EventsAPI.js";
import { CurrencyAPI } from "./api/CurrencyAPI.js";
import { SunTimesAPI } from "./api/SunTimesAPI.js";
import { PlansStorage } from "./storage/PlansStorage.js";
import { AppState } from "./state/AppState.js";
import { Router } from "./views/Router.js";
import { DashboardView } from "./views/DashboardView.js";
import { HolidaysView } from "./views/HolidaysView.js";
import { LongWeekendsView } from "./views/LongWeekendsView.js";
import { WeatherView } from "./views/WeatherView.js";
import { EventsView } from "./views/EventsView.js";
import { CurrencyView } from "./views/CurrencyView.js";
import { SunTimesView } from "./views/SunTimesView.js";
import { MyPlansView } from "./views/MyPlansView.js";
import { HeaderClock } from "./utils/HeaderClock.js";

class App {
  constructor() {
    this.countriesAPI = new CountriesAPI();
    this.holidaysAPI = new HolidaysAPI();
    this.weatherAPI = new WeatherAPI();
    this.eventsAPI = new EventsAPI();
    this.currencyAPI = new CurrencyAPI();
    this.sunTimesAPI = new SunTimesAPI();
    this.plansStorage = new PlansStorage();
    this.appState = new AppState();

    this.router = new Router();
    this.dashboardView = new DashboardView(this.countriesAPI, this.holidaysAPI, this.plansStorage, this.appState);
    this.holidaysView = new HolidaysView(this.holidaysAPI, this.appState, this.plansStorage);
    this.longWeekendsView = new LongWeekendsView(this.holidaysAPI, this.appState, this.plansStorage);
    this.weatherView = new WeatherView(this.weatherAPI, this.appState);
    this.eventsView = new EventsView(this.eventsAPI, this.appState, this.plansStorage);
    this.currencyView = new CurrencyView(this.currencyAPI);
    this.sunTimesView = new SunTimesView(this.weatherAPI, this.sunTimesAPI, this.appState);
    this.myPlansView = new MyPlansView(this.plansStorage, this.router);
    this.headerClock = new HeaderClock();
  }

  start() {
    this.router.init();
    this.dashboardView.init();
    this.holidaysView.init();
    this.longWeekendsView.init();
    this.weatherView.init();
    this.eventsView.init();
    this.currencyView.init();
    this.sunTimesView.init();
    this.myPlansView.init();
    this.headerClock.start();

    // Mobile menu toggle
const menuBtn = document.getElementById("mobile-menu-btn");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("sidebar-overlay");

menuBtn?.addEventListener("click", () => {
  sidebar?.classList.add("open");
  overlay?.classList.add("active");
});

overlay?.addEventListener("click", () => {
  sidebar?.classList.remove("open");
  overlay?.classList.remove("active");
});

sidebar?.querySelectorAll(".nav-item").forEach((item) => {
  item.addEventListener("click", () => {
    sidebar.classList.remove("open");
    overlay?.classList.remove("active");
  });
});
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const app = new App();
  app.start();
});
