const fs = require("fs");
let file = "src/components/game-screen.tsx";
let code = fs.readFileSync(file, "utf8");

// 1. fetchOnlineBoard Import sicherstellen
if (!code.includes("fetchOnlineBoard")) {
  code = code.replace(
    /import \{([^}]+)\} from ["']@\/game\/scores["'];?/,
    'import { $1, fetchOnlineBoard } from "@/game/scores";'
  );
}

// 2. profileError State einfügen
if (!code.includes("profileError")) {
  code = code.replace(
    /const \[profileInput,\s*setProfileInput\]\s*=\s*useState\([^)]*\);/,
    `const [profileInput, setProfileInput] = useState("");\n  const [profileError, setProfileError] = useState<string | null>(null);`
  );
}

// 3. handleSaveProfile Funktion vollständig ersetzen
const handleSaveRegex = /const handleSaveProfile\s*=\s*[\s\S]*?setIsEditing\(false\);\s*\};/;
const newHandleSave = `const handleSaveProfile = async () => {
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

    // Aktuelle Online-Bestenliste live prüfen
    const currentBoard = await fetchOnlineBoard();
    const isTaken = currentBoard.some(
      (b) => b.name.trim().toLowerCase() === clean.toLowerCase() && clean.toLowerCase() !== (profile.name || "").trim().toLowerCase()
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

if (code.match(handleSaveRegex)) {
  code = code.replace(handleSaveRegex, newHandleSave);
} else {
  // Fallback falls Funktion anders aufgebaut war
  code = code.replace(
    /const handleDeleteProfile\s*=/,
    `${newHandleSave}\n\n  const handleDeleteProfile =`
  );
}

// 4. Input-Feld und rote Fehlermeldung im Profil-Menü einfügen
if (!code.includes("profileError &&")) {
  code = code.replace(
    /(<input[^>]*value=\{profileInput\}[\s\S]*?\/>)/,
    `$1\n                  {profileError && (\n                    <p className="w-full text-left text-xs font-bold text-red-400 bg-red-950/80 border border-red-800 p-1.5 rounded mt-1">\n                      ⚠️ {profileError}\n                    </p>\n                  )}`
  );

  code = code.replace(
    /onChange=\{\(e\)\s*=>\s*setProfileInput\(e\.target\.value\)\}/,
    `onChange={(e) => { setProfileInput(e.target.value); if (profileError) setProfileError(null); }}`
  );
}

fs.writeFileSync(file, code, "utf8");
console.log("Startmenü-Profilprüfung erfolgreich aktualisiert!");
