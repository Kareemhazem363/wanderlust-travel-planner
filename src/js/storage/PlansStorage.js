export class PlansStorage {
  constructor() {
    this.key = "wanderlust_plans";
    this._listeners = [];
  }

  getAll() {
    const raw = localStorage.getItem(this.key);
    return raw ? JSON.parse(raw) : [];
  }

  count() {
    return this.getAll().length;
  }

  isSaved(planId) {
    return this.getAll().some((p) => p.id === planId);
  }

  save(plan) {
    const plans = this.getAll();
    if (plans.some((p) => p.id === plan.id)) return;
    plans.push({ ...plan, savedAt: new Date().toISOString() });
    localStorage.setItem(this.key, JSON.stringify(plans));
    this._notify();
  }

  remove(planId) {
    const plans = this.getAll().filter((p) => p.id !== planId);
    localStorage.setItem(this.key, JSON.stringify(plans));
    this._notify();
  }

  clear() {
    localStorage.removeItem(this.key);
    this._notify();
  }

  subscribe(fn) {
    this._listeners.push(fn);
  }

  _notify() {
    const plans = this.getAll();
    this._listeners.forEach((fn) => fn(plans));
  }
}
