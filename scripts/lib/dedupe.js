export function key(t){return String(t||"").toLowerCase().replace(/[^a-z0-9\u0900-\u097f ]/gi," ").replace(/\b(pune|latest|news|update|live|today|breaking|video|marathi)\b/g," ").replace(/\s+/g," ").trim()}
export function similar(a,b){const aw=a.split(" ").filter(x=>x.length>3),bw=b.split(" ").filter(x=>x.length>3);if(!aw.length||!bw.length)return false;const c=aw.filter(x=>bw.includes(x)).length;return c/Math.min(aw.length,bw.length)>=0.62}
export function mergeIncidents(items,rank){
  const groups=[];
  for(const item of items.sort((a,b)=>new Date(b.pubDate)-new Date(a.pubDate))){
    const k=key(item.title); if(!k)continue;
    let g=groups.find(x=>similar(k,x.key));
    if(g){g.items.push(item); if(new Date(item.pubDate)>new Date(g.main.pubDate))g.main=item}
    else groups.push({key:k,main:item,items:[item]});
  }
  return groups.map(g=>{
    const sources=[...new Set(g.items.map(x=>x.source).filter(Boolean))];
    const areas=[...new Set(g.items.flatMap(x=>x.areas||[]))];
    return {...g.main,sources,areas:areas.length?areas:g.main.areas,source:sources.length>1?`${sources[0]} + ${sources.length-1} more`:g.main.source,confidence:g.main.sourceClass==="official"?"High":sources.length>=3?"High":sources.length>=2?"Medium":"Single source"};
  }).sort((a,b)=>(rank(b.severity)*10+(b.sources?.length||1))-(rank(a.severity)*10+(a.sources?.length||1)) || new Date(b.pubDate)-new Date(a.pubDate));
}
