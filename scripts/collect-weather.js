import { REGIONS } from "./config/regions.js";
import { writeJson } from "./lib/io.js";

const regions = {};

await Promise.all(Object.entries(REGIONS).map(async ([key, zone]) => {
  try {
    const params = new URLSearchParams({
      latitude: String(zone.lat),
      longitude: String(zone.lon),
      current: "temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m,wind_gusts_10m",
      hourly: "precipitation_probability,visibility,precipitation",
      forecast_days: "1",
      timezone: "auto"
    });

    const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;

    const response = await fetch(url, {
      headers: { "User-Agent": "CITY-EMERGENCY-ALERTS-V5/5.0.2" }
    });

    if (!response.ok) {
      throw new Error(`Open-Meteo failed for ${key}: HTTP ${response.status}`);
    }

    const data = await response.json();
    const current = data.current || {};
    const hourly = data.hourly || {};

    const index = Array.isArray(hourly.time)
      ? Math.max(0, hourly.time.findIndex(t => String(t).slice(0, 13) === String(current.time || "").slice(0, 13)))
      : 0;

    const next6hRainMm = Array.isArray(hourly.precipitation)
      ? Number(hourly.precipitation.slice(index, index + 6).reduce((sum, val) => sum + (Number(val) || 0), 0).toFixed(1))
      : null;

    regions[key] = {
      label: zone.label,
      temp: current.temperature_2m ?? null,
      humidity: current.relative_humidity_2m ?? null,
      rain: current.rain ?? current.precipitation ?? 0,
      wind: current.wind_speed_10m ?? null,
      gust: current.wind_gusts_10m ?? null,
      code: current.weather_code ?? null,
      rainChance: Array.isArray(hourly.precipitation_probability) ? hourly.precipitation_probability[index] : null,
      visibility: Array.isArray(hourly.visibility) ? Math.round((hourly.visibility[index] || 0) / 1000) : null,
      next6hRainMm,
      source: "Open-Meteo",
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error(error);
    regions[key] = {
      label: zone.label,
      error: true,
      message: String(error.message || error),
      updatedAt: new Date().toISOString()
    };
  }
}));

await writeJson("data/weather.json", {
  generatedAt: new Date().toISOString(),
  source: "Open-Meteo",
  regions
});
