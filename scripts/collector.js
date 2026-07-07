import fs from "fs/promises";
import { SOURCES } from "./sources.js";
import { classify, rank } from "./classifier.js";

const OUT="data/live-alerts.json";
const WEATHER="data/weather.json";
const REGIONS={pune:{label:"Pune City (PMC)",lat:18.5204,lon:73.8567},pcmc:{label:"Pimpri-Chinchwad (PCMC)",lat:18.6298,lon:73.7997},alandi:{label:"Alandi Area",lat:18.6779,lon:73.8987},chakan:{label:"Chakan Industrial Cluster",lat:18.7606,lon:73.8637},khed:{label:"Khed Shivapur / Ghats",lat:18.3389,lon:73.8466},talegaon:{label:"Talegaon Dabhade",lat:18.7350,lon:73.6750},ranjangaon:{label:"Ranjangaon Zone",lat:18.7510,lon:74.2440},saswad:{label:"Saswad Region",lat:18.3435,lon:74.0317},fursungi:{label:"Fursungi / Uruli",lat:18.4783,lon:73.9735}};
const LOCALITIES=["Baner","Balewadi","Aundh","Kothrud","Karve Nagar","Warje","Sinhagad Road","Swargate","Shivajinagar","Camp","Koregaon Park","Kalyani Nagar","Viman Nagar","Kharadi","Hadapsar","Magarpatta","Katraj","Bavdhan","Pashan","Sus","Yerwada","Dhanori","Lohegaon","Wagholi","Hinjawadi","Wakad","Pimple Saudagar","Pimpri","Chinchwad","Nigdi","Bhosari","Akurdi","Ravet","Moshi","Chakan","Talegaon","Alandi","Saswad","Ranjangaon","Fursungi","Uruli Devachi","Khed Shivapur","Mumbai-Pune Expressway"];

function esc(s){return String(s||"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]))}
function strip(s){return String(s||"").replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim()}
function getTag(item,tag){const m=item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`,"i"));return m?strip(m[1].replace(/<!\[CDATA\[|\]\]>/g,"")):""}
function clean(t){return strip(t).split(" - ")[0]}
function sourceFrom(t){const p=strip(t).split(" - ");return p.length>1?p.slice(1).join(" - "):""}
function key(t){return String(t||"").toLowerCase().replace(/[^a-z0-9\u0900-\u097f ]/gi," ").replace(/\b(pune|latest|news|update|live|today|breaking|video|marathi)\b/g," ").replace(/\s+/g," ").trim()}
function similar(a,b){const aw=a.split(" ").filter(x=>x.length>3),bw=b.split(" ").filter(x=>x.length>3);if(!aw.length||!bw.length)return false;const c=aw.filter(x=>bw.includes(x)).length;return c/Math.min(aw.length,bw.length)>=0.62}
function areas(text){const l=String(text||"").toLowerCase();const found=LOCALITIES.filter(a=>l.includes(a.toLowerCase()));return [...new Set(found)].slice(0,6)}
function regionFor(areas){const s=areas.join(" ").toLowerCase();if(/pimpri|chinchwad|wakad|hinjawadi|nigdi|bhosari|akurdi|ravet|moshi/.test(s))return"pcmc";if(/chakan/.test(s))return"chakan";if(/alandi/.test(s))return"alandi";if(/talegaon/.test(s))return"talegaon";if(/saswad/.test(s))return"saswad";if(/ranjangaon/.test(s))return"ranjangaon";if(/fursungi|uruli/.test(s))return"fursungi";return"pune"}
async function fetchRSS(q,lang="en"){
  const feed=`https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=${lang==="mr"?"mr-IN":"en-IN"}&gl=IN&ceid=IN:${lang}`;
  const r=await fetch(feed,{headers:{"User-Agent":"CITY-EMERGENCY-ALERTS/5.0"}});
  if(!r.ok)return [];
  const xml=await r.text();
  const items=[...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].map(m=>m[1]);
  return items.map(it=>{
    const raw=getTag(it,"title"), title=clean(raw), source=sourceFrom(raw)||"News Source", link=getTag(it,"link"), pubDate=getTag(it,"pubDate")||new Date().toISOString();
    const c=classify(title+" "+source);
    const ar=areas(title+" "+source);
    return {id:key(title).slice(0,80),title,summary:title,source,sourceClass:q.includes("site:")?"official":"news",link,pubDate,lastUpdated:pubDate,areas:ar,region:regionFor(ar),sources:[source],confidence:q.includes("site:")?"High":"Medium",...c};
  });
}
function merge(items){
  const groups=[];
  for(const item of items.sort((a,b)=>new Date(b.pubDate)-new Date(a.pubDate))){
    const k=key(item.title); if(!k)continue;
    let g=groups.find(x=>similar(k,x.key));
    if(g){g.items.push(item); if(new Date(item.pubDate)>new Date(g.main.pubDate))g.main=item}
    else groups.push({key:k,main:item,items:[item]});
  }
  return groups.map(g=>{
    const sources=[...new Set(g.items.map(x=>x.source).filter(Boolean))];
    const areasAll=[...new Set(g.items.flatMap(x=>x.areas||[]))];
    const main={...g.main,sources,areas:areasAll.length?areasAll:g.main.areas,source:sources.length>1?`${sources[0]} + ${sources.length-1} more`:g.main.source,confidence:g.main.sourceClass==="official"?"High":sources.length>=3?"High":sources.length>=2?"Medium":"Single source"};
    return main;
  }).sort((a,b)=>(rank(b.severity)*10+(b.sources?.length||1))-(rank(a.severity)*10+(a.sources?.length||1)) || new Date(b.pubDate)-new Date(a.pubDate));
}
async function collectWeather(){
  const regions={};
  await Promise.all(Object.entries(REGIONS).map(async([k,z])=>{
    try{
      const url=`https://api.open-meteo.com/v1/forecast?latitude=${z.lat}&longitude=${z.lon}&current=temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m,wind_gusts_10m&hourly=precipitation_probability,visibility&forecast_days=1&timezone=auto`;
      const r=await fetch(url); const d=await r.json(); const c=d.current||{}, h=d.hourly||{}, i=Array.isArray(h.time)?Math.max(0,h.time.findIndex(t=>t.slice(0,13)===(c.time||"").slice(0,13))):0;
      regions[k]={temp:c.temperature_2m,humidity:c.relative_humidity_2m,rain:c.rain||c.precipitation||0,wind:c.wind_speed_10m,gust:c.wind_gusts_10m,code:c.weather_code,rainChance:Array.isArray(h.precipitation_probability)?h.precipitation_probability[i]:null,visibility:Array.isArray(h.visibility)?Math.round((h.visibility[i]||0)/1000):null};
    }catch(e){regions[k]=null}
  }));
  await fs.writeFile(WEATHER,JSON.stringify({generatedAt:new Date().toISOString(),regions},null,2));
}
async function main(){
  const results=[];
  for(const src of SOURCES){
    const arr=await Promise.allSettled(src.queries.map(q=>fetchRSS(q,src.lang)));
    arr.forEach(r=>{if(r.status==="fulfilled")results.push(...r.value)});
  }
  const merged=merge(results);
  const alerts=merged.filter(x=>x.critical||x.sourceClass==="official"||["emergency","warning"].includes(x.severity));
  const news=merged.filter(x=>!alerts.includes(x));
  await fs.writeFile(OUT,JSON.stringify({generatedAt:new Date().toISOString(),status:"ok",alerts,news,incidents:merged,summary:{total:merged.length,alerts:alerts.length,news:news.length}},null,2));
  await collectWeather();
}
main().catch(async e=>{console.error(e); await fs.writeFile(OUT,JSON.stringify({generatedAt:new Date().toISOString(),status:"error",error:String(e),alerts:[],news:[],incidents:[]},null,2)); process.exit(0)});
