import { readJson, writeJson } from "./lib/io.js";
const d=await readJson("data/live-alerts.json",{alerts:[],news:[]});
const w=await readJson("data/weather.json",{regions:{}});
const emergency=d.alerts.filter(x=>x.severity==="emergency").length;
const warning=d.alerts.filter(x=>x.severity==="warning").length;
const overall=emergency?"high-risk":warning>2?"caution":warning?"monitor":"normal";
await writeJson("data/status.json",{generatedAt:new Date().toISOString(),overall,summary:`${emergency} emergency alerts, ${warning} warnings, ${d.news.length} local incidents.`,weatherGeneratedAt:w.generatedAt||null});
