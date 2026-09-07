const fs = require("fs");
const file = "src/game/scores.ts";
let code = fs.readFileSync(file, "utf8");

// syncProfileOnline anpassen, sodass missions auch in stats mitgeschickt wird
const oldSync = `inventory:Array.isArray(p.inventory)?p.inventory:[],equipped:p.equipped||{}}`;
const newSync = `inventory:Array.isArray(p.inventory)?p.inventory:[],equipped:p.equipped||{},missions:p.missions||[]}`;

if (code.includes(oldSync)) {
  code = code.replace(oldSync, newSync);
  fs.writeFileSync(file, code, "utf8");
  console.log("✅ Teil 1 erledigt: syncProfileOnline überträgt nun auch missions!");
} else {
  console.log("ℹ️ Teil 1: syncProfileOnline ist bereits aktuell.");
}
