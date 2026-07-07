export function isFresh(item,hours=48){
  const t=new Date(item.lastUpdated||item.pubDate||Date.now()).getTime();
  return !t || Date.now()-t <= hours*3600000;
}
