export const $=s=>document.querySelector(s);
export const html=t=>{const d=document.createElement("div");d.textContent=String(t??"");return d.innerHTML};
export const attr=t=>String(t||"#").replace(/'/g,"%27").replace(/"/g,"%22");
export async function getJson(url){const r=await fetch(`${url}?v=${Date.now()}`,{cache:"no-store"});if(!r.ok)throw new Error(url);return r.json()}
export function fmtDate(v){const d=new Date(v);return isNaN(d)?"Recent":d.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})+" | "+d.toLocaleDateString("en-IN",{month:"short",day:"numeric"})}
export function syncText(){return"Last synced: "+new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:true})}
export function ageText(v){const t=new Date(v).getTime();if(!t)return"Data: fallback";const m=Math.round((Date.now()-t)/60000);return m<1?"Data: just now":m<60?`Data: ${m} min old`:`Data: ${Math.round(m/60)} hr old`}
export function hasRealLink(link){return /^https?:\/\//i.test(String(link||""))}
export function weatherText(code){if([95,96,99].includes(code))return"Thunderstorm";if([61,63,65,80,81,82].includes(code))return"Rain";if([51,53,55].includes(code))return"Drizzle";if([45,48].includes(code))return"Fog";if([1,2,3].includes(code))return"Cloudy";if(code===0)return"Clear";return"Weather"}
