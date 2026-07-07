import { writeJson } from "./lib/io.js";
const items=[
  {name:"Mumbai-Pune Expressway",status:"monitor",note:"Use official police and highway updates for closures/diversions."},
  {name:"Katraj Ghat / Tunnel",status:"monitor",note:"Check during heavy rain and landslide risk."},
  {name:"Sinhagad Road",status:"monitor",note:"Known waterlogging risk during intense rain."},
  {name:"Nagar Road",status:"monitor",note:"Traffic delays possible during peak hours."},
  {name:"Hinjawadi-Wakad",status:"monitor",note:"IT corridor congestion possible."}
];
await writeJson("data/traffic-status.json",{generatedAt:new Date().toISOString(),items});
