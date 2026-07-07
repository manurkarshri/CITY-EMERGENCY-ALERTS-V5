import{CONFIG,REGIONS}from"./config.js";
import{state}from"./state.js";
import{$,getJson,syncText,ageText,html,fmtDate}from"./utils.js";
import{filters}from"./filters.js";
import{feed,summary,weather as renderWeather,setDialogHandler}from"./render.js";
import{situation,quick,metrics}from"./dashboard.js";
import{staticUI,mapLinks}from"./static-ui.js";
import{pwa}from"./pwa.js";

async function init(){
  const locData=await getJson("data/localities.json").catch(()=>({localities:[],aliases:{}}));
  state.localities=["All Localities",...(locData.localities||[])];
  $("#regionSelect").innerHTML=Object.entries(REGIONS).map(([k,v])=>`<option value="${k}">${v.label}</option>`).join("");
  $("#localitySelect").innerHTML=state.localities.map(v=>`<option value="${v}">${v}</option>`).join("");
  $("#regionSelect").onchange=()=>{state.zoneKey=$("#regionSelect").value;mapLinks(state.zoneKey,state.locality);load()};
  $("#localitySelect").onchange=()=>{state.locality=$("#localitySelect").value;mapLinks(state.zoneKey,state.locality);draw()};
  document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>tab(b.dataset.tab));
  $("#alertSearch").oninput=draw; $("#incidentSearch").oninput=draw;
  filters($("#alertFilters"),draw,"alerts"); filters($("#incidentFilters"),draw,"incidents");
  setDialogHandler(openSummary); $("#dialogClose").onclick=()=>$("#alertDialog").close();
  staticUI(); mapLinks(state.zoneKey,state.locality); clock(); pwa();
  await load(); setInterval(load,CONFIG.refreshMs);
}
async function load(){
  $("#loader").style.display="block"; $("#loader").textContent="Loading emergency intelligence...";
  try{
    state.data=await getJson("data/live-alerts.json");
    state.weather=await getJson("data/weather.json").catch(()=>({regions:{}}));
    state.status=await getJson("data/status.json").catch(()=>({}));
    $("#loader").style.display="none"; $("#lastSync").textContent=syncText(); $("#dataAge").textContent=ageText(state.data.generatedAt); draw();
  }catch(e){$("#loader").textContent="Could not load live data. Check Official and Emergency tabs."; draw();}
}
function selectItems(items){
  if(state.locality==="All Localities")return items.filter(x=>!x.region||x.region===state.zoneKey||x.region==="all");
  const l=state.locality.toLowerCase();
  return items.filter(x=>(!x.region||x.region===state.zoneKey||x.region==="all") && ((x.areas||[]).join(" ").toLowerCase().includes(l)||String(x.title||"").toLowerCase().includes(l)||!x.areas?.length));
}
function draw(){
  const alerts=selectItems(state.data.alerts||[]);
  const incidents=selectItems(state.data.news||state.data.incidents||[]);
  const w=(state.weather.regions||{})[state.zoneKey];
  summary($("#summary"),alerts); renderWeather($("#weatherGrid"),w);
  situation($("#situationCard"),REGIONS[state.zoneKey].label,w,alerts,incidents);
  $("#quickSummary").textContent=quick(w,alerts,incidents); metrics($("#cityStatusGrid"),alerts,incidents);
  feed($("#alertFeed"),alerts,"alerts",$("#alertSearch").value); feed($("#incidentFeed"),incidents,"incidents",$("#incidentSearch").value);
}
function tab(id){document.querySelectorAll(".tab").forEach(b=>b.classList.remove("active"));document.querySelector(`[data-tab="${id}"]`).classList.add("active");document.querySelectorAll(".panel").forEach(p=>p.classList.add("hidden"));$("#"+id).classList.remove("hidden")}
function clock(){const t=()=>{$("#clock").innerText=new Date().toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})+" | "+new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:true})};t();setInterval(t,1000)}
function openSummary(a){$("#dialogContent").innerHTML=`<h3>${html(a.title)}</h3><p>${html(a.summary||"Open the source for more details.")}</p><p><strong>Areas:</strong> ${html((a.areas||[]).join(", ")||"Selected region")}<br><strong>Source:</strong> ${html(a.source||"Source")}<br><strong>Updated:</strong> ${fmtDate(a.lastUpdated||a.pubDate)}<br><strong>Action:</strong> ${html(a.action||"Check official source before acting.")}</p>`;$("#alertDialog").showModal()}
document.addEventListener("DOMContentLoaded",init);
