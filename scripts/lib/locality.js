import { LOCALITIES } from "../config/localities.js";
export function detectAreas(text){
  const l=String(text||"").toLowerCase();
  return [...new Set(LOCALITIES.filter(a=>l.includes(a.toLowerCase())))].slice(0,6);
}
export function regionFor(areas){
  const s=areas.join(" ").toLowerCase();
  if(/pimpri|chinchwad|wakad|hinjawadi|nigdi|bhosari|akurdi|ravet|moshi/.test(s))return"pcmc";
  if(/chakan/.test(s))return"chakan";
  if(/alandi/.test(s))return"alandi";
  if(/talegaon/.test(s))return"talegaon";
  if(/saswad/.test(s))return"saswad";
  if(/ranjangaon/.test(s))return"ranjangaon";
  if(/fursungi|uruli/.test(s))return"fursungi";
  return"pune";
}
