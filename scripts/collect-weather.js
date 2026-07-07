import { REGIONS } from "./config/regions.js";
import { writeJson } from "./lib/io.js";

const regions = {};

await Promise.all(Object.entries(REGIONS).map(async ([k, z]) => {
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${z.lat}&longitude=${z.lon}` +
      `&current=temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m,wind_gusts_10m` +
      `&hourly=precipitation_probability,visibility,precipitation` +
      `&forecast_days=1&timezone=auto`;

    const r = await fetch(url);
    if (!r.ok) throw new Error(`Weather fetch failed for ${k}: ${r.status}`);

    const d = await r.json();
    const c = d.current || {};
    const h = d.hourly || {};
    const i = Array.isArray(h.time)
      ? Math.max(0, h.time.findIndex(t => t.slice(0, 13) === (c.time || "").slice(0, 13)))
      : 0;

    const next6 = Array.isArray(h.precipitation)
      ? h.precipitation.slice(i, i + 6).reduce((a, b) => a + (Number(b) || 0), 0)
      : null;

    regions[k] = {
      temp: c.temperature_2m,
      humidity: c.relative_humidity_2m,
      rain: c.rain || c.precipitation || 0,
      wind: c.wind_speed_10m,
      gust: c.wind_gusts_10m,
      code: c.weather_code,
      rainChance: Array.isArray(h.precipitation_probability) ? h.precipitation_probability[i] : null,
      visibility: Array.isArray(h.visibility) ? Math.round((h.visibility[i] || 0) / 1000) : null,
      next6hRainMm: next6
    };
  } catch (e) {
    console.error(e);
    regions[k] = null;
  }
}));

await writeJson("data/weather.json", {
  generatedAt: new Date().toISOString(),
  regions
});
