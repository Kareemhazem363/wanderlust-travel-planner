// WMO weather interpretation codes (used by Open-Meteo)
const CODE_MAP = {
  0: { text: "Clear sky", icon: "fa-sun", theme: "weather-sunny" },
  1: { text: "Mainly clear", icon: "fa-sun", theme: "weather-sunny" },
  2: { text: "Partly cloudy", icon: "fa-cloud-sun", theme: "weather-cloudy" },
  3: { text: "Overcast", icon: "fa-cloud", theme: "weather-cloudy" },
  45: { text: "Fog", icon: "fa-smog", theme: "weather-cloudy" },
  48: { text: "Depositing rime fog", icon: "fa-smog", theme: "weather-cloudy" },
  51: { text: "Light drizzle", icon: "fa-cloud-rain", theme: "weather-rainy" },
  53: { text: "Moderate drizzle", icon: "fa-cloud-rain", theme: "weather-rainy" },
  55: { text: "Dense drizzle", icon: "fa-cloud-rain", theme: "weather-rainy" },
  61: { text: "Slight rain", icon: "fa-cloud-showers-heavy", theme: "weather-rainy" },
  63: { text: "Moderate rain", icon: "fa-cloud-showers-heavy", theme: "weather-rainy" },
  65: { text: "Heavy rain", icon: "fa-cloud-showers-heavy", theme: "weather-rainy" },
  71: { text: "Slight snow fall", icon: "fa-snowflake", theme: "weather-snowy" },
  73: { text: "Moderate snow fall", icon: "fa-snowflake", theme: "weather-snowy" },
  75: { text: "Heavy snow fall", icon: "fa-snowflake", theme: "weather-snowy" },
  80: { text: "Slight rain showers", icon: "fa-cloud-rain", theme: "weather-rainy" },
  81: { text: "Moderate rain showers", icon: "fa-cloud-rain", theme: "weather-rainy" },
  82: { text: "Violent rain showers", icon: "fa-cloud-showers-heavy", theme: "weather-rainy" },
  95: { text: "Thunderstorm", icon: "fa-bolt", theme: "weather-stormy" },
  96: { text: "Thunderstorm with hail", icon: "fa-bolt", theme: "weather-stormy" },
  99: { text: "Thunderstorm with heavy hail", icon: "fa-bolt", theme: "weather-stormy" },
};

export function describeWeatherCode(code) {
  return CODE_MAP[code] ?? { text: "Unknown", icon: "fa-cloud", theme: "weather-cloudy" };
}
