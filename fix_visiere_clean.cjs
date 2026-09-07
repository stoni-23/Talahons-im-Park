const fs = require("fs");
const file = "src/lib/shop.ts";
let code = fs.readFileSync(file, "utf8");

// Den Visier-Abschnitt suchen und exakt sperren
const oldVisiereRegex = /\{\s*id:\s*"visier_rot"[\s\S]*?id:\s*"visier_gold"[\s\S]*?available:\s*true\s*\}/;

const correctedVisiere = `{
    id: "visier_rot",
    name: "Scharfschützen-Rot",
    description: "Aggressives rotes Zielvisier für maximale Zielerfassung.",
    price: 5,
    category: "visier",
    icon: "🔴",
    crosshairColor: "#ef4444",
    rarity: "selten",
    available: false
  },
  {
    id: "visier_neon",
    name: "Giftgrün-Laser",
    description: "Exklusiv über Park-Missionen freischaltbar! 🟢",
    price: 0,
    category: "visier",
    icon: "🟢",
    crosshairColor: "#22c55e",
    rarity: "episch",
    available: false
  },
  {
    id: "visier_gold",
    name: "Goldenes Meister-Visier",
    description: "Aus purem Gold geschmiedetes Fadenkreuz.",
    price: 30,
    category: "visier",
    icon: "🟡",
    crosshairColor: "#eab308",
    rarity: "legendaer",
    available: false
  }`;

if (oldVisiereRegex.test(code)) {
  code = code.replace(oldVisiereRegex, correctedVisiere);
  fs.writeFileSync(file, code, "utf8");
  console.log("✅ Visiere erfolgreich gesperrt und mit Preisen/Schlössern versehen!");
} else {
  // Direkter Fallback über Zeilen-Ersetzung
  let lines = code.split("\n");
  const rotIdx = lines.findIndex(l => l.includes('id: "visier_rot"'));
  if (rotIdx !== -1) {
    const endIdx = lines.findIndex((l, i) => i > rotIdx && l.includes('];'));
    if (endIdx !== -1) {
      lines.splice(rotIdx, endIdx - rotIdx, correctedVisiere);
      fs.writeFileSync(file, lines.join("\n"), "utf8");
      console.log("✅ Visiere erfolgreich über Zeilenaustausch gesperrt!");
    }
  }
}
