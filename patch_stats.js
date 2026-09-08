const fs = require('fs');
const file = 'src/components/game-screen.tsx';
let c = fs.readFileSync(file, 'utf8');

// Nur für Fremde ausblenden
const searchStats = `<dt>Gespielte Runden</dt>`;
const replacementStats = `{!inspectedPlayer && (
                    <>
                      <dt>Gespielte Runden</dt>`;

const searchEndStats = `</dl>`;
const replacementEndStats = `    </>
                  )}
                </dl>`;

const searchBar = `<div className="mt-4 pt-3 border-t border-line/40">`;
const replacementBar = `{!inspectedPlayer && (
                  <div className="mt-4 pt-3 border-t border-line/40">`;

const searchEndBar = `</div>\n                    </div>\n                  );`;
const replacementEndBar = `</div>\n                    </div>\n                  )}
                  </>;`;

// Wir machen die einfachste und sicherste Ersetzung:
// 1. Gespielte Runden bis Ø Treffer in {!inspectedPlayer && (...)} packen
if (c.includes(searchStats) && !c.includes('!inspectedPlayer &&')) {
  c = c.replace(
    `<dt>Gespielte Runden</dt>
                  <dd className="text-right font-mono font-bold text-paper">{statsTarget.gamesPlayed || 0}</dd>
                  <dt>Gesamte Treffer</dt>
                  <dd className="text-right font-mono font-bold text-paper">{statsTarget.totalHits || 0}</dd>
                  <dt>Rekord</dt>
                  <dd className="text-right font-mono font-bold text-amber-400">{statsTarget.highScore || 0} Pkt</dd>
                  <dt>Ø Treffer / Runde</dt>
                  <dd className="text-right font-mono font-bold text-paper">
                    {statsTarget.gamesPlayed > 0 ? Math.round(statsTarget.totalHits / statsTarget.gamesPlayed) : 0}
                  </dd>`,
    `<dt>Rekord</dt>
                  <dd className="text-right font-mono font-bold text-amber-400">{statsTarget.highScore || 0} Pkt</dd>
                  {!inspectedPlayer && (
                    <>
                      <dt>Gespielte Runden</dt>
                      <dd className="text-right font-mono font-bold text-paper">{statsTarget.gamesPlayed || 0}</dd>
                      <dt>Gesamte Treffer</dt>
                      <dd className="text-right font-mono font-bold text-paper">{statsTarget.totalHits || 0}</dd>
                      <dt>Ø Treffer / Runde</dt>
                      <dd className="text-right font-mono font-bold text-paper">
                        {statsTarget.gamesPlayed > 0 ? Math.round(statsTarget.totalHits / statsTarget.gamesPlayed) : 0}
                      </dd>
                    </>
                  )}`
  );

  // 2. Fortschrittsbalken nur rendern wenn !inspectedPlayer
  c = c.replace(
    `{(() => {\n                  const prog = getLevelProgress(statsTarget.totalXp || 0);\n                  return (\n                    <div className="mt-4 pt-3 border-t border-line/40">`,
    `{!inspectedPlayer && (() => {\n                  const prog = getLevelProgress(statsTarget.totalXp || 0);\n                  return (\n                    <div className="mt-4 pt-3 border-t border-line/40">`
  );

  fs.writeFileSync(file, c);
  console.log("Erfolgreich gepatcht!");
} else {
  console.log("Muster nicht gefunden oder bereits aktiv.");
}
