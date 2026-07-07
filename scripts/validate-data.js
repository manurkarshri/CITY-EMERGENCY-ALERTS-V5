import fs from "fs/promises";
const files=["data/live-alerts.json","data/weather.json","data/status.json","data/localities.json"];
for(const f of files){
  const txt=await fs.readFile(f,"utf8");
  JSON.parse(txt);
  console.log("valid",f);
}
