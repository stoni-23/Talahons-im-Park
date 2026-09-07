const fs = require("fs");
const file = "src/components/game-screen.tsx";
let code = fs.readFileSync(file, "utf8");

// 1. Password-State & Ladeanzeige ergänzen
if (!code.includes("passwordInput")) {
  code = code.replace(
    /const \[profileInput,\s*setProfileInput\]\s*=\s*useState\([^)]*\);/,
    `const [profileInput, setProfileInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authLoading, setAuthLoading] = useState(false);`
  );
}

// 2. Lucide LogOut-Icon importieren
if (!code.includes("LogOut")) {
  code = code.replace(
    /import \{([^}]+)\} from ["']lucide-react["'];/,
    (match, p1) => `import { ${p1.trim()}, LogOut } from "lucide-react";`
  );
}

// 3. Supabase Auth-Funktionen einbauen (SHA-256)
if (!code.includes("handleAuth")) {
  const authLogic = `const hashPassword = async (pw: string) => {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(pw));
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  const handleAuth = async () => {
    const clName = profileInput.trim();
    const clPw = passwordInput.trim();
    if (!clName || clName.length < 2) return setProfileError("Name min. 2 Zeichen!");
    if (!clPw || clPw.length < 4) return setProfileError("Passwort min. 4 Zeichen!");

    setAuthLoading(true);
    setProfileError(null);

    const SUPA_URL = "https://lforuvtpskrnydlburpt.supabase.co";
    const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxmb3J1dnRwc2tybnlkbGJ1cnB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4NjAwMDQsImV4cCI6MjEwMzQzNjAwNH0.dXH7H7VhUPYNcMSGztdJT9L6CYZrnJEdj75xAXo0RPY";

    try {
      const pwHash = await hashPassword(clPw);
      const res = await fetch(\`\${SUPA_URL}/rest/v1/accounts?username=eq.\${encodeURIComponent(clName)}&select=username,password_hash\`, {
        headers: { apikey: SUPA_KEY, Authorization: \`Bearer \${SUPA_KEY}\` }
      });
      const data = await res.json();

      if (data && data.length > 0) {
        if (data[0].password_hash !== pwHash) {
          setProfileError("Falsches Passwort für diesen Namen!");
          setAuthLoading(false);
          return;
        }
      } else {
        const reg = await fetch(\`\${SUPA_URL}/rest/v1/accounts\`, {
          method: "POST",
          headers: {
            apikey: SUPA_KEY,
            Authorization: \`Bearer \${SUPA_KEY}\`,
            "Content-Type": "application/json",
            Prefer: "return=minimal"
          },
          body: JSON.stringify({ username: clName, password_hash: pwHash })
        });
        if (!reg.ok) {
          setProfileError("Registrierung fehlgeschlagen.");
          setAuthLoading(false);
          return;
        }
      }

      const ex = loadProfile(clName);
      const up = { name: clName, highScore: ex.highScore, gamesPlayed: ex.gamesPlayed, totalHits: ex.totalHits };
      saveProfile(up);
      setProfile(up);
      setPasswordInput("");
      setIsEditing(false);
    } catch (e) {
      setProfileError("Fehler bei der Server-Verbindung.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setActiveUserName("");
    setProfile({ name: "", highScore: 0, gamesPlayed: 0, totalHits: 0 });
    setProfileInput("");
    setPasswordInput("");
    setIsEditing(true);
  };`;

  const saveRegex = /const handleSaveName = async \(\) => \{[\s\S]*?setIsEditing\(false\);\s*\};/;
  code = code.replace(saveRegex, authLogic);
}

// 4. Startmenü Box: Name + Passwort + Abmelden
const newBox = `<div className="w-full max-w-sm rounded-xl border border-line bg-ink/90 p-3 shadow-lg">
                <div className="mb-2 flex items-center justify-between">
                  <p className="flex items-center gap-1.5 text-xs font-bold tracking-[0.14em] text-paper uppercase">
                    <User className="size-3.5 text-amber-400" /> Profil
                  </p>
                  <span className="font-mono text-xs font-bold text-amber-400">
                    Rekord: {profile.highScore} Pkt
                  </span>
                </div>

                {!isEditing && profile.name ? (
                  <div className="flex items-center justify-between rounded-md border border-line bg-ink-3 px-3 py-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-paper-dim uppercase font-bold tracking-wider">Eingeloggt als</span>
                      <span className="text-sm font-bold text-paper">{profile.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleLogout}
                      title="Abmelden"
                      className="flex items-center gap-1.5 rounded border border-line bg-ink px-2.5 py-1 text-xs text-red-400 hover:bg-red-950/50"
                    >
                      <LogOut className="size-3.5" /> Abmelden
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 w-full">
                    <input
                      type="text"
                      maxLength={16}
                      value={profileInput}
                      onChange={(e) => { setProfileInput(e.target.value); setProfileError(null); }}
                      placeholder="Name (min. 2 Zeichen)"
                      className="h-9 w-full rounded-md border border-line bg-ink px-3 text-xs text-paper outline-none placeholder:text-muted"
                    />
                    <input
                      type="password"
                      maxLength={32}
                      value={passwordInput}
                      onChange={(e) => { setPasswordInput(e.target.value); setProfileError(null); }}
                      placeholder="Passwort (min. 4 Zeichen)"
                      className="h-9 w-full rounded-md border border-line bg-ink px-3 text-xs text-paper outline-none placeholder:text-muted"
                    />
                    <button
                      type="button"
                      disabled={authLoading}
                      onClick={handleAuth}
                      className="h-9 w-full rounded-md bg-paper font-bold text-xs text-ink hover:bg-paper/90 disabled:opacity-50"
                    >
                      {authLoading ? "Prüfe..." : "Einloggen / Registrieren"}
                    </button>
                    {profileError && (
                      <p className="w-full text-left text-xs font-bold text-red-400 bg-red-950/80 border border-red-800 p-1.5 rounded">
                        ⚠️ {profileError}
                      </p>
                    )}
                  </div>
                )}
              </div>`;

const boxRegex = /<div className="w-full max-w-[a-z0-9-]+ rounded-xl border border-line bg-ink\/90 p-3 shadow-lg">[\s\S]*?Rekord:[\s\S]*?\{profile\.highScore\}[\s\S]*?<\/div>\s*<\/div>/;
if (boxRegex.test(code)) {
  code = code.replace(boxRegex, newBox);
}

fs.writeFileSync(file, code, "utf8");
console.log("🔒 Passwort-Schutz & Login erfolgreich im Startmenü installiert!");
