import { SOURCES } from "./config/sources.js";
import { classify } from "./lib/classifier.js";
import { fetchGoogleNews, getTag, cleanTitle, sourceFromTitle } from "./lib/rss.js";
import { detectAreas, regionFor } from "./lib/locality.js";
import { writeJson } from "./lib/io.js";
import { key } from "./lib/dedupe.js";

const rows = [];

for (const sourceConfig of SOURCES.filter(source => source.official)) {
  const settled = await Promise.allSettled(
    sourceConfig.queries.map(query => fetchGoogleNews(query, sourceConfig.lang))
  );

  for (const result of settled) {
    if (result.status !== "fulfilled") {
      console.warn("Official source failed:", result.reason);
      continue;
    }

    for (const item of result.value) {
      const rawTitle = getTag(item, "title");
      const title = cleanTitle(rawTitle);
      const source = sourceFromTitle(rawTitle) || "Official Source";
      const link = getTag(item, "link");
      const pubDate = getTag(item, "pubDate") || new Date().toISOString();

      if (!title || !link) continue;

      const classification = classify(`${title} ${source}`);
      const areas = detectAreas(`${title} ${source}`);

      rows.push({
        id: key(title).slice(0, 90),
        title,
        summary: title,
        source,
        sourceClass: "official",
        link,
        pubDate,
        lastUpdated: pubDate,
        areas,
        region: regionFor(areas),
        sources: [source],
        confidence: "High",
        ...classification,
        critical: true
      });
    }
  }
}

await writeJson("data/raw-official.json", {
  generatedAt: new Date().toISOString(),
  items: rows
});
