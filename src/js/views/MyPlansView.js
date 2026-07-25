const TYPE_ICON = {
  holiday: "fa-calendar-check",
  event: "fa-ticket",
  longweekend: "fa-umbrella-beach",
};

export class MyPlansView {
  constructor(plansStorage, router) {
    this.plansStorage = plansStorage;
    this.router = router;

    this.content = document.getElementById("plans-content");
    this.filterButtons = document.querySelectorAll(".plan-filter");
    this.clearAllBtn = document.getElementById("clear-all-plans-btn");

    this.countAll = document.getElementById("filter-all-count");
    this.countHoliday = document.getElementById("filter-holiday-count");
    this.countEvent = document.getElementById("filter-event-count");
    this.countLw = document.getElementById("filter-lw-count");

    this.currentFilter = "all";
  }

  init() {
    this.plansStorage.subscribe((plans) => this.render(plans));
    this.render(this.plansStorage.getAll());

    this.filterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        this.currentFilter = btn.dataset.filter;
        this.filterButtons.forEach((b) => b.classList.toggle("active", b === btn));
        this.render(this.plansStorage.getAll());
      });
    });

    this.clearAllBtn?.addEventListener("click", () => {
      if (confirm("Remove all saved plans? This can't be undone.")) {
        this.plansStorage.clear();
      }
    });

    this.content?.addEventListener("click", (e) => {
      const deleteBtn = e.target.closest("[data-delete-plan-id]");
      if (deleteBtn) {
        this.plansStorage.remove(deleteBtn.dataset.deletePlanId);
        return;
      }
      const exploreBtn = e.target.closest("#start-exploring-btn");
      if (exploreBtn) {
        this.router?.navigate("dashboard");
      }
    });
  }

  render(plans) {
    this._renderCounts(plans);

    const filtered = this.currentFilter === "all" ? plans : plans.filter((p) => p.type === this.currentFilter);

    if (!filtered.length) {
      this.content.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon"><i class="fa-solid fa-heart-crack"></i></div>
          <h3>No Saved Plans Yet</h3>
          <p>Start exploring and save holidays, events, or long weekends you like!</p>
          <button class="btn-primary" id="start-exploring-btn">
            <i class="fa-solid fa-compass"></i> Start Exploring
          </button>
        </div>`;
      return;
    }

    this.content.innerHTML = filtered
      .map((p) => {
        const icon = TYPE_ICON[p.type] ?? "fa-heart";
        const dateLabel = p.date ? new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";

        return `
          <div class="plan-card">
            <div class="plan-card-icon type-${p.type}"><i class="fa-solid ${icon}"></i></div>
            <div class="plan-card-body">
              <h3>${p.title}</h3>
              <p>${p.subtitle ?? ""}</p>
              ${dateLabel ? `<span class="plan-card-date"><i class="fa-regular fa-calendar"></i> ${dateLabel}</span>` : ""}
            </div>
            <button class="plan-delete-btn" data-delete-plan-id="${p.id}"><i class="fa-solid fa-trash"></i></button>
          </div>`;
      })
      .join("");
  }

  _renderCounts(plans) {
    const counts = { holiday: 0, event: 0, longweekend: 0 };
    plans.forEach((p) => {
      if (counts[p.type] !== undefined) counts[p.type]++;
    });

    if (this.countAll) this.countAll.textContent = plans.length;
    if (this.countHoliday) this.countHoliday.textContent = counts.holiday;
    if (this.countEvent) this.countEvent.textContent = counts.event;
    if (this.countLw) this.countLw.textContent = counts.longweekend;
  }
}
