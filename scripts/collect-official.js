import { SOURCES } from "./config/sources.js";
import { classify } from "./lib/classifier.js";
import { fetchGoogleNews, getTag, cleanTitle, sourceFromTitle } from "./lib/rss.js";
import { detectAreas, regionFor } from "./lib/locality.js";
import { writeJson } from "./lib/io.js";
import { key } from "./lib/dedupe.js";

const rows=[];
for(const src of SOURCES.filter(s=>s.official)){
  const settled=await Promise.allSettled(src.queries.map(q=>fetchGoogleNews(q,src.lang)));
  for(const res of settled){
    if(res.status!=="fulfilled")continue;
    for(const it of res.value){
      const raw=getTag(it,"title"), title=cleanTitle(raw), source=sourceFromTitle(raw)||"Official Source", link=getTag(it,"link"), pubDate=getTag(it,"pubDate")||new Date().toISOString();
      if(!title||!link)continue;
      const c=classify(title+" "+source); const areas=detectAreas(title+" "+source);
      rows.push({id:key(title).slice(0,80),title,summary:title,source,sourceClass:"official",link,pubDate,lastUpdated:pubDate,areas,region:regionFor(areas),sources:[source],confidence:"High",...c,critical:true});
    }
  }
}
await writeJson("data/raw-official.json",{generatedAt:new Date().toISOString(),items:rows});
