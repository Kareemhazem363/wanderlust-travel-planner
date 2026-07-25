export class HeaderClock {
  constructor() {
    this.el = document.getElementById("current-datetime");
  }

  start() {
    if (!this.el) return;
    const tick = () => {
      const now = new Date();
      this.el.textContent = now.toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    };
    tick();
    setInterval(tick, 1000 * 30);
  }
}
