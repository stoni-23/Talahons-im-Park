const fs = require("fs");
let file = "src/components/game-screen.tsx";
let code = fs.readFileSync(file, "utf8");

// 1. State für profileError hinzufügen
if (!code.includes("profileError")) {
  code = code.replace(
    /const \[profileInput,\s*setProfileInput\]\s*=\s*useState\([^)]*\);/,
    `const [profileInput, setProfileInput] = useState("");\n  const [profileError, setProfileError] = useState<string | null>(null);`
  );
}

// 2. handleSaveProfile mit Live-Validierung gegen die Online-Rangliste ausstatten
const saveProfileRegex = /const handleSaveProfile\s*=\s*(\(\)\s*=>|async \(\)\s*=>)\s*\{[\s\S]*?setProfileInput\([^)]*\);[\s\S]*?\};/;

const newSaveProfile = `const handleSaveProfile = async () => {
    const clean = profileInput.trim();
    if (!clean || clean.length < 2) {
      setProfileError("Name muss mindestens 2 Zeichen lang sein.");
      return;
    }

    const blocked = ["park-besucher", "parktourist", "spieler", "anonym", "gast"];
    if (blocked.includes(clean.toLowerCase())) {
      setProfileError("Dieser Name ist nicht erlaubt.");
      return;
    }

    const currentBoard = await fetchOnlineBoard();
    const isTaken = currentBoard.some(
      (b) => b.name.trim().toLowerCase() === clean.toLowerCase() && clean.toLowerCase() !== profile.name.trim().toLowerCase()
    );

    if (isTaken) {
      setProfileError("Name ist bereits vergeben! Wähle einen anderen.");
      return;
    }

    setProfileError(null);
    const existing = loadProfile(clean);
    const updated: PlayerProfile = {
      name: clean,
      highScore: Math.max(existing.highScore, profile.highScore),
      gamesPlayed: Math.max(existing.gamesPlayed, profile.gamesPlayed),
      totalHits: Math.max(existing.totalHits, profile.totalHits),
    };
    saveProfile(updated);
    setProfile(updated);
    setProfileInput(clean);
    setIsEditing(false);
  };`;

if (code.match(saveProfileRegex)) {
  code = code.replace(saveProfileRegex, newSaveProfile);
}

// 3. Fehlermeldung unter das Input-Feld im Startmenü einbauen
if (!code.includes("profileError &&")) {
  code = code.replace(
    /(<input[^>]*value=\{profileInput\}[\s\S]*?\/>)/,
    `$1\n                {profileError && (\n                  <p className="w-full text-left text-xs font-bold text-red-400 bg-red-950/80 border border-red-800 p-1.5 rounded mt-1">\n                    ⚠️ {profileError}\n                  </p>\n                )}`
  );

  code = code.replace(
    /onChange=\{\(e\)\s*=>\s*setProfileInput\(e\.target\.value\)\}/,
    `onChange={(e) => { setProfileInput(e.target.value); if (profileError) setProfileError(null); }}`
  );
}

fs.writeFileSync(file, code, "utf8");
console.log("Menü-Profil Prüfung erfolgreich eingebaut!");
