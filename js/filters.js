import{FILTERS}from"./config.js";
let alertFilter="all", incidentFilter="all";
export function current(mode){return mode==="incidents"?incidentFilter:alertFilter}
export function filters(el,on,mode){const cur=current(mode);el.innerHTML=FILTERS.map(([k,l])=>`<button class="filter ${k===cur?"active":""}" data-f="${k}">${l}</button>`).join("");el.querySelectorAll(".filter").forEach(b=>b.onclick=()=>{if(mode==="incidents")incidentFilter=b.dataset.f;else alertFilter=b.dataset.f;el.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));b.classList.add("active");on()})}
