import fs from "fs/promises";

const files = [
  "data/live-alerts.json",
  "data/weather.json",
  "data/status.json",
  "data/localities.json",
  "data/river-status.json",
  "data/traffic-status.json"
];

for (const file of files) {
  const text = await fs.readFile(file, "utf8");
  const json = JSON.parse(text);
  console.log(`VALID JSON: ${file}`);

  if (file === "data/live-alerts.json") {
    console.log(`  alerts: ${(json.alerts || []).length}`);
    console.log(`  news: ${(json.news || []).length}`);
    console.log(`  incidents: ${(json.incidents || []).length}`);
  }

  if (file === "data/weather.json") {
    console.log(`  weather regions: ${Object.keys(json.regions || {}).length}`);
  }
}
