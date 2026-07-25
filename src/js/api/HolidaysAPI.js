export class HolidaysAPI {
  constructor() {
    this.base = "https://date.nager.at/api/v3";
  }

  // Public holidays for a country in a given year
  async getPublicHolidays(year, countryCode) {
    const res = await fetch(`${this.base}/PublicHolidays/${year}/${countryCode}`);
    if (!res.ok) throw new Error("Could not load public holidays");
    return res.json();
  }

  // Long weekends for a country in a given year
  async getLongWeekends(year, countryCode) {
    const res = await fetch(`${this.base}/LongWeekend/${year}/${countryCode}`);
    if (!res.ok) throw new Error("Could not load long weekends");
    return res.json();
  }
}
