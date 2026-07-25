const VIEWS = {
  dashboard: { title: "Dashboard", subtitle: "Welcome back! Ready to plan your next adventure?" },
  holidays: { title: "Holidays", subtitle: "Browse public holidays for your destination" },
  events: { title: "Events", subtitle: "Discover concerts, sports, and cultural events" },
  weather: { title: "Weather", subtitle: "Check the 7-day forecast for your destination" },
  "long-weekends": { title: "Long Weekends", subtitle: "Find holidays near weekends for mini-trips" },
  currency: { title: "Currency", subtitle: "Convert between currencies with live rates" },
  "sun-times": { title: "Sun Times", subtitle: "Sunrise and sunset times for your destination" },
  "my-plans": { title: "My Plans", subtitle: "Your saved holidays, events, and trip ideas" },
};

export class Router {
  constructor() {
    this.navItems = document.querySelectorAll(".nav-item[data-view]");
    this.viewSections = document.querySelectorAll(".view");
    this.pageTitle = document.getElementById("page-title");
    this.pageSubtitle = document.getElementById("page-subtitle");
    this.onViewChange = null; // optional callback(viewName)
  }

  init() {
    this.navItems.forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        const view = item.dataset.view;
        this.navigate(view);
      });
    });

    window.addEventListener("popstate", () => {
      const view = this._viewFromPath(window.location.pathname);
      this._activate(view, false);
    });

    const initialView = this._viewFromPath(window.location.pathname);
    this._activate(initialView, false);
  }

  navigate(viewName) {
    this._activate(viewName, true);
  }

  _activate(viewName, pushState) {
    if (!VIEWS[viewName]) viewName = "dashboard";

    this.viewSections.forEach((section) => {
      section.classList.toggle("active", section.id === `${viewName}-view`);
    });

    this.navItems.forEach((item) => {
      item.classList.toggle("active", item.dataset.view === viewName);
    });

    const meta = VIEWS[viewName];
    if (this.pageTitle) this.pageTitle.textContent = meta.title;
    if (this.pageSubtitle) this.pageSubtitle.textContent = meta.subtitle;

    if (pushState) {
      const path = viewName === "dashboard" ? "/" : `/${viewName}`;
      history.pushState({}, "", path);
    }

    if (this.onViewChange) this.onViewChange(viewName);
  }

  _viewFromPath(pathname) {
    const clean = pathname.replace(/^\/+|\/+$/g, "");
    return clean === "" ? "dashboard" : clean;
  }
}
