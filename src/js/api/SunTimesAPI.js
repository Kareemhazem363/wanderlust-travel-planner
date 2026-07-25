export class SunTimesAPI {
  constructor() {
    this.base = "https://api.sunrise-sunset.org/v2?lat=36.7201600&lng=-4.4203400";
  }
  async getSunTimes(latitude, longitude, tzid) {
    const params = new URLSearchParams({ lat: latitude, lng: longitude, tzid });
    const res = await fetch(`${this.base}?${params.toString()}`);
    if (!res.ok) throw new Error("Could not load sun times");
    const json = await res.json();
    if (json.status !== "OK") throw new Error("Could not load sun times for this location");
    return json.results;
  }
}
