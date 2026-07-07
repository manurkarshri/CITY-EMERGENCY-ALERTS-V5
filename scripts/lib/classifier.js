export function classify(text){
  const l=String(text||"").toLowerCase();
  const rules=[
    {w:["red alert","school closed","schools closed","college closed","orange alert"],severity:"emergency",category:"weather",type:"Public Weather Alert",icon:"🚨",critical:true,action:"Follow official instructions and avoid unnecessary travel."},
    {w:["dam release","river overflow","flood warning","flood","water level"],severity:"emergency",category:"flood",type:"Flood Alert",icon:"🌊",critical:true,action:"Avoid low-lying areas, river banks and flooded roads."},
    {w:["landslide","ghat","rockfall"],severity:"emergency",category:"weather",type:"Landslide",icon:"⛰️",critical:true,action:"Avoid ghat roads and check police updates."},
    {w:["fire","blaze","smoke"],severity:"emergency",category:"fire",type:"Fire",icon:"🔥",critical:true,action:"Avoid the area. Call 101 or 112 if nearby."},
    {w:["road closure","route closure","blocked","diversion"],severity:"warning",category:"traffic",type:"Route Closure",icon:"🚧",critical:true,action:"Use alternate route and follow police diversion."},
    {w:["accident","crash","collision","pile-up"],severity:"warning",category:"traffic",type:"Accident",icon:"🚑",critical:false,action:"Expect delays. Avoid the affected road if possible."},
    {w:["traffic","congestion","jam","expressway","highway"],severity:"watch",category:"traffic",type:"Traffic Update",icon:"🚦",critical:false,action:"Check route before starting travel."},
    {w:["power","electricity","outage","msedcl"],severity:"watch",category:"power",type:"Power Update",icon:"⚡",critical:true,action:"Avoid fallen wires and contact MSEDCL for hazards."},
    {w:["theft","crime","robbery","arrest"],severity:"watch",category:"safety",type:"Safety News",icon:"🚓",critical:false,action:"Stay alert and follow police advisories."},
    {w:["tree fall","trees fall","wall collapse","waterlogging","disruption","delayed","cancelled","parking shed"],severity:"watch",category:"impact",type:"Local Impact",icon:"⚠️",critical:false,action:"Be cautious in the affected area."}
  ];
  for(const r of rules){ if(r.w.some(x=>l.includes(x))) return r; }
  return {severity:"advisory",category:"general",type:"Information",icon:"ℹ️",critical:false,action:"No immediate action required."};
}
export function rank(s){return {emergency:4,warning:3,watch:2,advisory:1}[s]||1}
