export function strip(s){return String(s||"").replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim()}
export function getTag(item,tag){const m=item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`,"i"));return m?strip(m[1].replace(/<!\[CDATA\[|\]\]>/g,"")):""}
export function cleanTitle(t){return strip(t).split(" - ")[0]}
export function sourceFromTitle(t){const p=strip(t).split(" - ");return p.length>1?p.slice(1).join(" - "):""}
export async function fetchGoogleNews(q,lang="en"){
  const feed=`https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=${lang==="mr"?"mr-IN":"en-IN"}&gl=IN&ceid=IN:${lang}`;
  const r=await fetch(feed,{headers:{"User-Agent":"CITY-EMERGENCY-ALERTS/5.0"}});
  if(!r.ok)return [];
  const xml=await r.text();
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].map(m=>m[1]);
}
