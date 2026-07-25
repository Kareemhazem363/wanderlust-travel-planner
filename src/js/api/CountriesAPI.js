export class CountriesAPI {
  constructor() {
    this.nagerBase = "https://date.nager.at/api/v3";
    this.restCountriesBase = "https://api.restcountries.com/countries/v5";
  }

  async getAllCountries() {
    const res = await fetch(`${this.nagerBase}/AvailableCountries`);
    if (!res.ok) throw new Error("Could not load the countries list");
    return res.json();
  }

  async getCountryDetails(countryName) {
    try {
      const url = `${this.restCountriesBase}/names.common/${encodeURIComponent(countryName)}?response_fields_omit=names.native,names.translations`;
      const res = await fetch(url, {
        headers: { Authorization: "Bearer rc_live_639bea718b9d48ea90c95d2f13071e80" },
      });
      if (res.ok) {
        const json = await res.json();
        return json.data?.objects?.[0] ?? null;
      }
    } catch (e) {
      console.log("Fallback to public API");
    }
    const fallbackRes = await fetch("https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fullText=true");
    if (!fallbackRes.ok) throw new Error("Could not load country details");
    const json = await fallbackRes.json();
    return json?.[0] ?? null;
  }
}