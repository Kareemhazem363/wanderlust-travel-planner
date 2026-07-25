const EXCHANGE_RATE_API_KEY = "c91c95b0d2170e6b9d88eb18";

export class CurrencyAPI {
  constructor() {
    this.base = `https://v6.exchangerate-api.com/v6/${EXCHANGE_RATE_API_KEY}`;
  }

  // All conversion rates relative to a base currency (default USD)
  async getLatestRates(baseCurrency = "USD") {
    const res = await fetch(`${this.base}/latest/${baseCurrency}`);
    if (!res.ok) throw new Error("Could not load exchange rates");
    return res.json();
  }

  // Direct conversion between two currencies for a given amount
  async convertPair(fromCurrency, toCurrency, amount) {
    const res = await fetch(`${this.base}/pair/${fromCurrency}/${toCurrency}/${amount}`);
    if (!res.ok) throw new Error("Could not convert this currency pair");
    return res.json();
  }
}
