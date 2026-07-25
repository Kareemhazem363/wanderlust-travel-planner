export class Country {
  constructor(rawData, countryCode) {
    this.code = countryCode;
    this.name = rawData.names?.common ?? rawData.name?.common ?? "—";
    this.officialName = rawData.names?.official ?? rawData.name?.official ?? this.name;
    this.capital = rawData.capitals?.[0]?.name ?? rawData.capital?.[0] ?? "—";
    this.region = rawData.region ?? "—";
    this.subregion = rawData.subregion ?? "";
    this.area = rawData.area?.kilometers ?? rawData.area ?? 0;
    this.flag = rawData.flag?.url_png ?? rawData.flags?.png ?? "";
    this.borders = rawData.borders ?? [];
    this.timezone = rawData.timezones?.[0] ?? "UTC+00:00";
    this.callingCode = rawData.calling_codes?.[0] ?? (rawData.idd?.root ? `${rawData.idd.root}${rawData.idd.suffixes?.[0] ?? ""}` : "—");
    if (rawData.currencies) {
      const currencyKey = Object.keys(rawData.currencies)[0];
      const cur = rawData.currencies[currencyKey];
      this.currency = cur?.name ?? "—";
      this.currencySymbol = cur?.symbol ?? "";
    } else {
      this.currency = "—";
      this.currencySymbol = "";
    }
    this.languages = Array.isArray(rawData.languages) 
      ? rawData.languages.map(l => l.name) 
      : (rawData.languages ? Object.values(rawData.languages) : []);
    this.population = rawData.population ?? rawData.demographics?.population ?? 0;
    this.drivingSide = rawData.car?.side ?? rawData.cars?.driving_side ?? null;
    this.continent = rawData.continents?.[0] ?? this.region;
  }

  get formattedPopulation() {
    return this.population ? this.population.toLocaleString("en-US") : "—";
  }

  get formattedArea() {
    return this.area ? `${this.area.toLocaleString("en-US")} km²` : "—";
  }

  get utcOffsetMinutes() {
    const match = this.timezone.match(/UTC([+-])(\d{2}):(\d{2})/);
    if (!match) return 0;
    const [, sign, hours, minutes] = match;
    const total = parseInt(hours, 10) * 60 + parseInt(minutes, 10);
    return sign === "-" ? -total : total;
  }
}