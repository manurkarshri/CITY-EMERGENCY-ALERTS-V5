export function strip(value) {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function getTag(item, tag) {
  const match = item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? strip(match[1].replace(/<!\[CDATA\[|\]\]>/g, "")) : "";
}

export function cleanTitle(title) {
  return strip(title).split(" - ")[0];
}

export function sourceFromTitle(title) {
  const parts = strip(title).split(" - ");
  return parts.length > 1 ? parts.slice(1).join(" - ") : "";
}

export async function fetchGoogleNews(query, lang = "en") {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const feed =
      `https://news.google.com/rss/search?q=${encodeURIComponent(query)}` +
      `&hl=${lang === "mr" ? "mr-IN" : "en-IN"}` +
      `&gl=IN&ceid=IN:${lang}`;

    const response = await fetch(feed, {
      signal: controller.signal,
      headers: { "User-Agent": "CITY-EMERGENCY-ALERTS-V5/5.0.2" }
    });

    if (!response.ok) return [];

    const xml = await response.text();
    return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].map(match => match[1]);
  } catch (error) {
    console.warn("Google News fetch failed:", query, String(error.message || error));
    return [];
  } finally {
    clearTimeout(timeout);
  }
}
