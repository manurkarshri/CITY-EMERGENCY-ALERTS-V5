import { readJson, writeJson } from "./lib/io.js";
const data=await readJson("data/live-alerts.json",{alerts:[],news:[],incidents:[]});
for(const item of [...(data.alerts||[]),...(data.news||[])]){
  const t=(item.title+" "+item.summary).toLowerCase();
  const effects=[];
  if(/rain|flood|waterlogging/.test(t))effects.push("Rain / waterlogging may affect travel.");
  if(/traffic|road|diversion|blocked/.test(t))effects.push("Road delay or diversion possible.");
  if(/power|electricity/.test(t))effects.push("Power supply impact possible.");
  if(effects.length)item.correlation=effects;
}
await writeJson("data/live-alerts.json",data);
