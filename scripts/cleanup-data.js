import { readJson, writeJson } from "./lib/io.js";
import { isFresh } from "./lib/expiry.js";
const data=await readJson("data/live-alerts.json",{alerts:[],news:[],incidents:[]});
data.alerts=(data.alerts||[]).filter(x=>isFresh(x,72));
data.news=(data.news||[]).filter(x=>isFresh(x,48));
data.incidents=(data.incidents||[]).filter(x=>isFresh(x,72));
data.cleanedAt=new Date().toISOString();
await writeJson("data/live-alerts.json",data);
