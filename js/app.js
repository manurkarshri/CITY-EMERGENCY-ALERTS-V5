import{CONFIG,REGIONS}from"./config.js";
import{$,getJson,syncText,ageText,html,fmtDate}from"./utils.js";
import{filters,feed,summary,weather as renderWeather,setDialogHandler}from"./render.js";
import{situation,quick,metrics}from"./dashboard.js";
import{staticUI,mapLinks}from"./static-ui.js";
import{pwa}from"./pwa.js";

let zoneKey="pune", locality="All Localities", data={alerts:[],news:[],incidents:[],generatedAt:null}, weatherData={regions:{}};
let localities=[];

async function init(){
  const locData=await getJson("data/localities.json").catch(()=>({pune:[],pcmc:[],nearby:[],aliases:{}}));
  localities=["All Localities",...(locData.pune||[]),...(locData.pcmc||[]),...(locData.nearby||[])];
  document.querySelector("#regionSelect").innerHTML=Object.entries(REGIONS).map(([k,v])=>`<option value="${k}">${v.label}</option>`).join("");
  document.querySelector("#localitySelect").innerHTML=localities.map(v=>`<option value="${v}">${v}</option>`).join("");
  document.querySelector("#regionSelect").onchange=()=>{zoneKey=document.querySelector("#regionSelect").value;mapLinks(zoneKey,locality);load()};
  document.querySelector("#localitySelect").onchange=()=>{locality=document.querySelector("#localitySelect").value;mapLinks(zoneKey,locality);draw()};
  document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>tab(b.dataset.tab));
  document.querySelector("#alertSearch").oninput=draw;
  document.querySelector("#incidentSearch").oninput=draw;
  filters(document.querySelector("#alertFilters"),draw,"alerts");
  filters(document.querySelector("#incidentFilters"),draw,"incidents");
  setDialogHandler(openSummary);
  document.querySelector("#dialogClose").onclick=()=>document.querySelector("#alertDialog").close();
  staticUI(); mapLinks(zoneKey,locality); clock(); pwa();
  await load(); setInterval(load,CONFIG.refreshMs);
}
async function load(){
  document.querySelector("#loader").style.display="block";
  document.querySelector("#loader").textContent="Loading emergency intelligence...";
  try{
    data=await getJson("data/live-alerts.json");
    weatherData=await getJson("data/weather.json").catch(()=>({regions:{}}));
    document.querySelector("#loader").style.display="none";
    document.querySelector("#lastSync").textContent=syncText();
    document.querySelector("#dataAge").textContent=ageText(data.generatedAt);
    draw();
  }catch(e){
    document.querySelector("#loader").textContent="Could not load live data. Check Official and Emergency tabs.";
    draw();
  }
}
function selectItems(items){
  if(locality==="All Localities")return items.filter(x=>!x.region||x.region===zoneKey||x.region==="all");
  const l=locality.toLowerCase();
  return items.filter(x=>(!x.region||x.region===zoneKey||x.region==="all") && ((x.areas||[]).join(" ").toLowerCase().includes(l)||String(x.title||"").toLowerCase().includes(l)||!x.areas?.length));
}
function draw(){
  const alerts=selectItems(data.alerts||[]);
  const incidents=selectItems(data.news||data.incidents||[]);
  const w=(weatherData.regions||{})[zoneKey];
  summary(document.querySelector("#summary"),alerts);
  renderWeather(document.querySelector("#weatherGrid"),w);
  situation(document.querySelector("#situationCard"),REGIONS[zoneKey].label,w,alerts,incidents);
  document.querySelector("#quickSummary").textContent=quick(w,alerts,incidents);
  metrics(document.querySelector("#cityStatusGrid"),alerts,incidents);
  feed(document.querySelector("#alertFeed"),alerts,"alerts",document.querySelector("#alertSearch").value);
  feed(document.querySelector("#incidentFeed"),incidents,"incidents",document.querySelector("#incidentSearch").value);
}
function tab(id){document.querySelectorAll(".tab").forEach(b=>b.classList.remove("active"));document.querySelector(`[data-tab="${id}"]`).classList.add("active");document.querySelectorAll(".panel").forEach(p=>p.classList.add("hidden"));document.querySelector("#"+id).classList.remove("hidden")}
function clock(){const t=()=>{document.querySelector("#clock").innerText=new Date().toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})+" | "+new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:true})};t();setInterval(t,1000)}
function openSummary(a){document.querySelector("#dialogContent").innerHTML=`<h3>${html(a.title)}</h3><p>${html(a.summary||"Open the source for more details.")}</p><p><strong>Areas:</strong> ${html((a.areas||[]).join(", ")||"Selected region")}<br><strong>Source:</strong> ${html(a.source||"Source")}<br><strong>Updated:</strong> ${fmtDate(a.lastUpdated||a.pubDate)}<br><strong>Action:</strong> ${html(a.action||"Check official source before acting.")}</p>`;document.querySelector("#alertDialog").showModal()}
document.addEventListener("DOMContentLoaded",init);
