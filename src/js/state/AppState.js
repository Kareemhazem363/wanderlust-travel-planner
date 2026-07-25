export class AppState {
  constructor() {
    this.country = { code: "EG", name: "Egypt" };
    this.city = "Cairo";
    this.year = new Date().getFullYear();
    this._listeners = [];
  }

  update(partial) {
    Object.assign(this, partial);
    this._listeners.forEach((fn) => fn(this));
  }

  subscribe(fn) {
    this._listeners.push(fn);
  }
}
