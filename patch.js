const fs = require("fs");
const file = "src/components/game-screen.tsx";
let code = fs.readFileSync(file, "utf8");

// 1. Error-States hinzufügen
code = code.replace(
  'const [profileInput, setProfileInput] = useState("");',
  'const [profileInput, setProfileInput] = useState("");\n  const [profileError, setProfileError] = useState<string | null>(null);\n  const [nameError, setNameError] = useState<string | null>(null);'
);

// 2. handleSaveName mit Online-Prüfung und roter Fehlermeldung ersetzen
const oldSave = `  const handleSaveName = () => {
    const chosenName = profileInput.trim() || "Parktourist";
    const existing = loadProfile(chosenName);
    const updated = {
      name: chosenName,
      highScore: existing.highScore,
      gamesPlayed: existing.gamesPlayed,
      totalHits: existing.totalHits,
    };
    saveProfile(updated);
    setProfile(updated);
    setProfileInput(chosenName);
    setIsEditing(false);
  };`;

const newSave = `  const handleSaveName = async () => {
    const clean = profileInput.trim();
    if (!clean || clean.length < 2) {
      setProfileError("Name muss mindestens 2 Zeichen lang sein.");
      return;
    }
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
code = code.replace(oldSave, newSave);

// 3. Startmenü: Rote Warnung unter das Namensfeld setzen
const oldMenuInput = `                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={16}
                        value={profileInput}
                        onChange={(e) => setProfileInput(e.target.value)}
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
                    </div>`;

const newMenuInput = `                    <div className="flex flex-col gap-1.5 w-full">
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
code = code.replace(oldMenuInput, newMenuInput);

// 4. Spielende: Warnung bei vergebenem Namen + Gast-Button
const oldEndForm = `            {!named ? (
              <form
                className="mt-4 flex w-full max-w-xs flex-col gap-2"
                onSubmit={async (e: FormEvent) => {
                  e.preventDefault();
                  if (!name.trim()) return;
                  setNamed(true);
                  const updated = await submitScore(name, hud.score);
                  setBoard(updated);
                }}
              >
                <label className="text-left text-[11px] font-medium tracking-[0.14em] text-paper-dim uppercase">
                  Name für die 🏆 Bestenliste
                </label>
                <div className="flex gap-2">
                  <input
                    autoFocus
                    maxLength={16}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Dein Name"
                    className="h-11 flex-1 rounded-md border border-line bg-ink px-3 text-sm text-paper outline-none placeholder:text-muted"
                  />
                  <button type="submit" className="h-11 rounded-md bg-paper px-4 font-semibold text-sm text-ink">
                    Speichern
                  </button>
                </div>
              </form>
            ) : (`;

const newEndForm = `            {!named ? (
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
                    const currentBoard = await fetchOnlineBoard();
                    const isTaken = currentBoard.some(
                      (b) => b.name.trim().toLowerCase() === clean.toLowerCase() && clean.toLowerCase() !== (profile.name || "").trim().toLowerCase()
                    );
                    if (isTaken) {
                      setNameError("Name ist bereits vergeben! Wähle einen anderen.");
                      return;
                    }
                    setNameError(null);
                    setNamed(true);
                    const updated = await submitScore(clean, hud.score);
                    setBoard(updated);
                  }}
                >
                  <label className="text-left text-[11px] font-medium tracking-[0.14em] text-paper-dim uppercase">
                    Name für die 🏆 Bestenliste
                  </label>
                  {nameError && (
                    <p className="w-full text-left text-xs font-bold text-red-400 bg-red-950/80 border border-red-800 p-1.5 rounded">
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
                      className="h-11 flex-1 rounded-md border border-line bg-ink px-3 text-sm text-paper outline-none placeholder:text-muted"
                    />
                    <button type="submit" className="h-11 rounded-md bg-paper px-4 font-semibold text-sm text-ink">
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
                  className="h-9 w-full rounded-md border border-line/60 bg-ink/50 text-xs text-paper-dim hover:text-paper"
                >
                  Als Gast fortfahren (ohne Wertung)
                </button>
              </div>
            ) : (`;
code = code.replace(oldEndForm, newEndForm);

fs.writeFileSync(file, code, "utf8");
console.log("Patch sauber angewendet!");
