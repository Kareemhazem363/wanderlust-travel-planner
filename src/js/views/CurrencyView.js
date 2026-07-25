// A small display-name table for the currencies shown in the static markup.
// Any other currency code populated into the dropdowns just shows its code.
const CURRENCY_NAMES = {
  USD: "US Dollar",
  EUR: "Euro",
  GBP: "British Pound",
  EGP: "Egyptian Pound",
  AED: "UAE Dirham",
  SAR: "Saudi Riyal",
  JPY: "Japanese Yen",
  CAD: "Canadian Dollar",
  INR: "Indian Rupee",
};

// code -> flag country-code, for the Quick Convert grid
const POPULAR = [
  { code: "EUR", flag: "eu" },
  { code: "GBP", flag: "gb" },
  { code: "EGP", flag: "eg" },
  { code: "AED", flag: "ae" },
  { code: "SAR", flag: "sa" },
  { code: "JPY", flag: "jp" },
  { code: "CAD", flag: "ca" },
  { code: "INR", flag: "in" },
];

export class CurrencyView {
  constructor(currencyAPI) {
    this.currencyAPI = currencyAPI;

    this.amountInput = document.getElementById("currency-amount");
    this.fromSelect = document.getElementById("currency-from");
    this.toSelect = document.getElementById("currency-to");
    this.convertBtn = document.getElementById("convert-btn");
    this.swapBtn = document.getElementById("swap-currencies-btn");
    this.resultBox = document.getElementById("currency-result");
    this.popularGrid = document.getElementById("popular-currencies");
  }

  async init() {
    if (!this.fromSelect) return;

    try {
      const data = await this.currencyAPI.getLatestRates("USD");
      this._populateSelects(Object.keys(data.conversion_rates));
      this._renderPopular(data);
    } catch (err) {
      if (this.popularGrid) this.popularGrid.innerHTML = `<p class="status-msg">${err.message}</p>`;
    }

    this.convertBtn?.addEventListener("click", () => this.convert());
    this.swapBtn?.addEventListener("click", () => this._swap());

    this.convert();
  }

  _populateSelects(codes) {
    const sorted = [...codes].sort();
    const buildOptions = (selected) =>
      sorted
        .map((code) => {
          const label = CURRENCY_NAMES[code] ? `${code} - ${CURRENCY_NAMES[code]}` : code;
          return `<option value="${code}"${code === selected ? " selected" : ""}>${label}</option>`;
        })
        .join("");

    const currentFrom = this.fromSelect.value || "USD";
    const currentTo = this.toSelect.value || "EGP";
    this.fromSelect.innerHTML = buildOptions(currentFrom);
    this.toSelect.innerHTML = buildOptions(currentTo);
  }

  _renderPopular(data) {
    if (!this.popularGrid) return;
    this.popularGrid.innerHTML = POPULAR.map((p) => {
      const rate = data.conversion_rates[p.code];
      return `
        <div class="popular-currency-card">
          <img src="https://flagcdn.com/w40/${p.flag}.png" alt="${p.code}" class="flag">
          <div class="info"><div class="code">${p.code}</div><div class="name">${CURRENCY_NAMES[p.code] ?? p.code}</div></div>
          <div class="rate">${rate?.toFixed(4) ?? "—"}</div>
        </div>`;
    }).join("");
  }

  async convert() {
    const amount = Number(this.amountInput?.value) || 0;
    const from = this.fromSelect?.value;
    const to = this.toSelect?.value;
    if (!from || !to || !this.resultBox) return;

    try {
      const data = await this.currencyAPI.convertPair(from, to, amount);

      this.resultBox.innerHTML = `
        <div class="conversion-display">
          <div class="conversion-from">
            <span class="amount">${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
            <span class="currency-code">${from}</span>
          </div>
          <div class="conversion-equals"><i class="fa-solid fa-equals"></i></div>
          <div class="conversion-to">
            <span class="amount">${data.conversion_result.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
            <span class="currency-code">${to}</span>
          </div>
        </div>
        <div class="exchange-rate-info">
          <p>1 ${from} = ${data.conversion_rate} ${to}</p>
          <small>Last updated: ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</small>
        </div>`;
    } catch (err) {
      this.resultBox.innerHTML = `<p class="status-msg">${err.message}</p>`;
    }
  }

  _swap() {
    const from = this.fromSelect.value;
    this.fromSelect.value = this.toSelect.value;
    this.toSelect.value = from;
    this.convert();
  }
}
