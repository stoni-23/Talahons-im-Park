const fs = require("fs");
let code = fs.readFileSync("src/components/game-screen.tsx", "utf8");

if (!code.includes("nameError")) {
  code = code.replace(
    /const \[name,\s*setName\]\s*=\s*useState\([^)]*\);/,
    `const [name, setName] = useState("");\n  const [nameError, setNameError] = useState<string | null>(null);`
  );
}

const formBlockRegex = /\{!named \? \([\s\S]*?<form[\s\S]*?<\/form>\s*\) : \(/;
const newFormBlock = `{!named ? (
          <div className="mt-4 flex w-full max-w-xs flex-col gap-2">
            <form
              className="flex flex-col gap-2"
              onSubmit={async (e: FormEvent) => {
                e.preventDefault();
                const clean = name.trim();
                
                if (!clean || clean.length < 2) {
                  setNameError("Name muss mindestens 2 Zeichen lang sein.");
                  return;
                }

                const blockedNames = ["park-besucher", "parktourist", "spieler", "anonym", "gast"];
                if (blockedNames.includes(clean.toLowerCase())) {
                  setNameError("Dieser Name ist nicht erlaubt.");
                  return;
                }

                let savedName = "";
                try {
                  const raw = localStorage.getItem("bankgeheimnis_profile");
                  if (raw) savedName = (JSON.parse(raw).name || "").trim().toLowerCase();
                } catch {}

                const currentBoard = await fetchOnlineBoard();
                const isTaken = currentBoard.some(
                  (b) => b.name.trim().toLowerCase() === clean.toLowerCase() && clean.toLowerCase() !== savedName
                );

                if (isTaken) {
                  setNameError("Name ist schon vergeben! Wähle einen anderen.");
                  return;
                }

                try {
                  const raw = localStorage.getItem("bankgeheimnis_profile");
                  const prof = raw ? JSON.parse(raw) : {};
                  prof.name = clean;
                  localStorage.setItem("bankgeheimnis_profile", JSON.stringify(prof));
                } catch {}

                setNameError(null);
                setNamed(true);
                const updated = await submitScore(clean, hud.score);
                setBoard(updated);
              }}
            >
              <label className="text-left text-[11px] font-medium tracking-[0.14em] text-paper-dim uppercase">
                🏆 In die Bestenliste eintragen
              </label>

              {nameError && (
                <p className="rounded bg-red-950/80 p-1.5 text-left text-xs font-bold text-red-400 border border-red-800">
                  ⚠️ {nameError}
                </p>
              )}

              <div className="flex gap-2">
                <input
                  autoFocus
                  maxLength={16}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (nameError) setNameError(null);
                  }}
                  placeholder="Dein Name"
                  className="h-11 flex-1 rounded-md border border-line bg-ink px-3 text-sm text-paper outline-none placeholder:text-muted focus:border-paper"
                />
                <button
                  type="submit"
                  disabled={!name.trim()}
                  className="h-11 rounded-md bg-paper px-4 font-semibold text-sm text-ink disabled:opacity-50 hover:opacity-90"
                >
                  Speichern
                </button>
              </div>
            </form>

            <button
              type="button"
              onClick={() => {
                setNameError(null);
                setNamed(true);
              }}
              className="h-9 w-full rounded-md border border-line/60 bg-ink/50 text-xs font-medium text-paper-dim hover:text-paper hover:bg-ink/80 transition-colors"
            >
              Als Gast fortfahren (ohne Wertung)
            </button>
          </div>
        ) : (`;

code = code.replace(formBlockRegex, newFormBlock);
fs.writeFileSync("src/components/game-screen.tsx", code, "utf8");
console.log("game-screen.tsx aktualisiert!");
