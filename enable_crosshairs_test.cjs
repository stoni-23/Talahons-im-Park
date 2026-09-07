const fs = require("fs");
const { execSync } = require("child_process");

const file = "src/lib/shop.ts";
fs.copyFileSync(file, file + ".testbak");
let content = fs.readFileSync(file, "utf8");

content = content.replace(
  /id:\s*"visier_rot",[\s\S]*?price:\s*\d+,[\s\S]*?available:\s*(?:false|true)/,
  `id: "visier_rot",\n    name: "Scharfschützen-Rot",\n    description: "Aggressives rotes Zielvisier für maximale Zielerfassung.",\n    price: 0,\n    category: "visier",\n    icon: "🔴",\n    crosshairColor: "#ef4444",\n    rarity: "selten",\n    available: true`
);

content = content.replace(
  /id:\s*"visier_neon",[\s\S]*?price:\s*\d+,[\s\S]*?available:\s*(?:false|true)/,
  `id: "visier_neon",\n    name: "Giftgrün-Laser",\n    description: "Stechgrünes Visier – sticht selbst bei Nacht heraus.",\n    price: 0,\n    category: "visier",\n    icon: "🟢",\n    crosshairColor: "#22c55e",\n    rarity: "episch",\n    available: true`
);

content = content.replace(
  /id:\s*"visier_gold",[\s\S]*?price:\s*\d+,[\s\S]*?available:\s*(?:false|true)/,
  `id: "visier_gold",\n    name: "Goldenes Meister-Visier",\n    description: "Aus purem Gold geschmiedetes Fadenkreuz.",\n    price: 0,\n    category: "visier",\n    icon: "🟡",\n    crosshairColor: "#eab308",\n    rarity: "legendaer",\n    available: true`
);

fs.writeFileSync(file, content, "utf8");
console.log("✅ Visiere auf Gratis & Verfügbar gestellt.");
execSync("npm run build", { stdio: "inherit" });
