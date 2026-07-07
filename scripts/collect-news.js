import { SOURCES } from "./config/sources.js";
import { classify } from "./lib/classifier.js";
import { fetchGoogleNews, getTag, cleanTitle, sourceFromTitle } from "./lib/rss.js";
import { detectAreas, regionFor } from "./lib/locality.js";
import { writeJson } from "./lib/io.js";
import { key } from "./lib/dedupe.js";

const rows=[];
for(const src of SOURCES.filter(s=>!s.official)){
  const settled=await Promise.allSettled(src.queries.map(q=>fetchGoogleNews(q,src.lang)));
  for(const res of settled){
    if(res.status!=="fulfilled")continue;
    for(const it of res.value){
      const raw=getTag(it,"title"), title=cleanTitle(raw), source=sourceFromTitle(raw)||src.name, link=getTag(it,"link"), pubDate=getTag(it,"pubDate")||new Date().toISOString();
      if(!title||!link)continue;
      const c=classify(title+" "+source); const areas=detectAreas(title+" "+source);
      rows.push({id:key(title).slice(0,80),title,summary:title,source,sourceClass:"news",link,pubDate,lastUpdated:pubDate,areas,region:regionFor(areas),sources:[source],confidence:"Medium",...c});
    }
  }
}
await writeJson("data/raw-news.json",{generatedAt:new Date().toISOString(),items:rows});
