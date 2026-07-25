export class WeatherAPI {
  constructor() {
    this.geoBase = "https://geocoding-api.open-meteo.com/v1";
    this.forecastBase = "https://api.open-meteo.com/v1";
  }

  // Turns a city name into { latitude, longitude }
  async geocode(cityName) {
    const res = await fetch(`${this.geoBase}/search?name=${encodeURIComponent(cityName)}&count=1`);
    if (!res.ok) throw new Error("Could not locate that city");
    const json = await res.json();
    const place = json.results?.[0];
    if (!place) throw new Error("City not found");
    return { latitude: place.latitude, longitude: place.longitude };
  }

  // Lightweight call just to resolve the IANA timezone name for a coordinate
  async getTimezone(latitude, longitude) {
    const res = await fetch(`${this.forecastBase}/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&timezone=auto`);
    if (!res.ok) throw new Error("Could not resolve timezone");
    const json = await res.json();
    return json.timezone;
  }

  // Full current + hourly + 7-day forecast for a coordinate
  async getForecast(latitude, longitude) {
    const params = new URLSearchParams({
      latitude,
      longitude,
      current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,uv_index",
      hourly: "temperature_2m,weather_code,precipitation_probability",
      daily: "weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_direction_10m_dominant",
      timezone: "auto",
    });

    const res = await fetch(`${this.forecastBase}/forecast?${params.toString()}`);
    if (!res.ok) throw new Error("Could not load the weather forecast");
    return res.json();
  }
}
