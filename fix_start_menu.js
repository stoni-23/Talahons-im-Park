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

// 3. handleSaveName ersetzen mit Online-Prüfung und roter Fehlermeldung
const handleSaveNameRegex = /const handleSaveName\s*=\s*[\s\S]*?setIsEditing\(false\);\s*\};/;

const newHandleSaveName = `const handleSaveName = async () => {
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

    // Live-Prüfung gegen die Online-Bestenliste
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
    const updated = {
      name: clean,
      highScore: existing.highScore,
      gamesPlayed: existing.gamesPlayed,
      totalHits: existing.totalHits,
    };
    saveProfile(updated);
    setProfile(updated);
    setProfileInput(clean);
    setIsEditing(false);
  };`;

code = code.replace(handleSaveNameRegex, newHandleSaveName);

// 4. Profil-Input & rote Fehlermeldung im Startmenü einsetzen
const oldInputBlockRegex = /<div className="flex gap-2">\s*<input[\s\S]*?placeholder="Dein Name\.\.\."[\s\S]*?<\/button>\s*<\/div>/;

const newInputBlock = `<div className="flex flex-col gap-1.5">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={16}
                          value={profileInput}
                          onChange={(e) => {
                            setProfileInput(e.target.value);
                            if (profileError) setProfileError(null);
                          }}
                          placeholder="Dein Name..."
                          className="h-9 flex-1 rounded-md border border-line bg-ink px-3 text-xs text-paper outline-none placeholder:text-muted"
                        />
                        <button
                          type="button"
                          onClick={handleSaveName}
                          className="h-9 rounded-md bg-paper px-4 text-xs font-bold text-ink hover:bg-paper/90"
                        >
                          OK
                        </button>
                      </div>
                      {profileError && (
                        <p className="w-full text-left text-xs font-bold text-red-400 bg-red-950/80 border border-red-800 p-1.5 rounded">
                          ⚠️ {profileError}
                        </p>
                      )}
                    </div>`;

code = code.replace(oldInputBlockRegex, newInputBlock);

fs.writeFileSync(file, code, "utf8");
console.log("Startmenü erfolgreich mit Live-Namensprüfung aktualisiert!");
