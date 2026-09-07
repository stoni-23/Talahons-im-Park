const fs = require("fs");
const { execSync } = require("child_process");

const file = "src/components/game-screen.tsx";
let code = fs.readFileSync(file, "utf8");

// 1. Finde und entferne den verfrühten missions-Block oben (ca. Zeile 64-85)
const prematureBlockRegex = /const \[missions, setMissions\] = React\.useState<Mission\[\]>\(INITIAL_MISSIONS\);[\s\S]*?\n  \}, \[profile\?\.name, profile\?\.missions\]\);/;

if (prematureBlockRegex.test(code)) {
  code = code.replace(prematureBlockRegex, "");
  console.log("  [+] Verfrühten missions-State oben entfernt.");
}

// 2. Füge missions und den Synchronisations-Hook DIREKT nach der Deklaration von profile ein
const profileDeclRegex = /(const \[profile, setProfile\] = useState<PlayerProfile>[\s\S]*?;\n)/;

const correctPlacement = `$1
  const [missions, setMissions] = React.useState<Mission[]>(INITIAL_MISSIONS);

  // Synchronisiere Missionen immer mit dem eingeloggten Profil (NACH Deklaration von profile)
  React.useEffect(() => {
    if (!profile?.name?.trim()) {
      setMissions(INITIAL_MISSIONS);
      return;
    }
    if (Array.isArray(profile.missions) && profile.missions.length > 0) {
      setMissions(profile.missions);
    } else {
      setMissions(INITIAL_MISSIONS);
    }
  }, [profile?.name, profile?.missions]);
`;

code = code.replace(profileDeclRegex, correctPlacement);

fs.writeFileSync(file, code, "utf8");

console.log("Starte Build...");
try {
  execSync("npm run build", { stdio: "inherit" });
  console.log("\n🎉 ERFOLG: Reihenfolge repariert! Kein ReferenceError mehr.");
} catch (err) {
  console.error("Fehler beim Build:", err.message);
  process.exit(1);
}
