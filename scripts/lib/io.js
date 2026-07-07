import fs from "fs/promises";
export async function readJson(path,fallback){try{return JSON.parse(await fs.readFile(path,"utf8"))}catch{return fallback}}
export async function writeJson(path,data){await fs.mkdir(path.split("/").slice(0,-1).join("/"),{recursive:true});await fs.writeFile(path,JSON.stringify(data,null,2))}
