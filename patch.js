const fs = require("fs");
let code = fs.readFileSync("src/game/engine.ts", "utf8");

// 1. Opa Spawn: Richtige Groesse und Z-Ebene hinter Talahon
code = code.replace(
  /spawnOpa\(\)\s*\{[\s\S]*?phase:\s*"move",\s*\}\);\s*\}/,
  `spawnOpa() {
    playOpaSpawn();
    if (this.targets.some((t) => t.act === "opa")) return;
    const fromRight = Math.random() < 0.5;
    const speed = 60;
    const lane = LANES[2]!;
    this.targets.push({
      ...this.baseTarget(),
      id: this.id++,
      act: "opa",
      x: fromRight ? 960 : -80,
      y: lane.y,
      vx: (fromRight ? -1 : 1) * speed,
      z: lane.z - 0.02,
      facing: fromRight ? -1 : 1,
      points: -50,
      scale: lane.scale * 1.35,
      phase: "move",
    });
  }`
);

// 2. Rocker Spawn: Groesser (1.65) auf Lane 1 oder 2
code = code.replace(
  /spawnRocker\(\)\s*\{[\s\S]*?phase:\s*"move",\s*\}\);\s*\}/,
  `spawnRocker() {
    if (this.targets.some((t) => t.act === "rocker" && t.state === "alive")) return;
    import("./audio").then((a) => a.playRocker());
    const fromRight = Math.random() < 0.5;
    const speed = 260;
    const laneI = Math.random() < 0.5 ? 1 : 2;
    const lane = LANES[laneI]!;
    this.targets.push({
      ...this.baseTarget(),
      id: this.id++,
      act: "rocker",
      x: fromRight ? 960 : -80,
      y: lane.y,
      vx: (fromRight ? -1 : 1) * speed,
      z: lane.z + 0.02,
      facing: fromRight ? -1 : 1,
      points: 200,
      scale: lane.scale * 1.65,
      phase: "move",
    });
  }`
);

// 3. Update: Feste Basis-Y fuer Rocker + Rauch-Spawn
code = code.replace(
  /if \(t\.act === "walk" \Vert{}\Vert{} t\.act === "run" \Vert{}\Vert{} t\.act === "rocker" \Vert{}\Vert{} t\.act === "opa"\) \{[\s\S]*?t\.x \+= t\.vx \* dt;\s*continue;\s*\}/,
  `if (t.act === "walk" || t.act === "run" || t.act === "rocker" || t.act === "opa") {
        t.phaseT += dt;
        if (t.act === "rocker" && t.state === "alive") {
          const baseLaneY = (LANES[2]?.y || 430);
          t.y = baseLaneY + Math.sin(t.x * 0.2) * 2;
          if (t.phaseT > 0.06) {
            t.phaseT = 0;
            const rx = t.x - (t.facing * 48 * t.scale);
            const ry = t.y - 8 * t.scale;
            this.particles.push({
              x: rx,
              y: ry,
              vx: (t.facing * -50) + (Math.random() * 20 - 10),
              vy: -20 - Math.random() * 20,
              life: 0.55,
              max: 0.55,
              size: 7 * t.scale,
              color: "#94a3b8",
              rot: Math.random() * 6,
              vr: (Math.random() - 0.5) * 4,
              kind: "smoke",
            } as any);
          }
        }
        t.x += t.vx * dt;
        continue;
      }`
);

// 4. Opa Lauf-Animation: Vor Hit langsam (0.48s), nach Hit schnell fliehen (0.14s)
code = code.replace(
  /if \(t\.act === "opa"\) \{[\s\S]*?return this\.img\([^)]+\);\s*\}/,
  `if (t.act === "opa") {
      const showHit = t.state === "falling" && t.phase !== "leave";
      if (showHit) return this.img("opa_hit") || this.img("opa-lauf");
      const stepInterval = t.phase === "leave" ? 0.14 : 0.48;
      const step = Math.floor(t.phaseT / stepInterval) % 2;
      return (step === 0 ? this.img("opa-lauf") : this.img("opa-steht")) || this.img("opa-lauf");
    }`
);

// 5. Rauch nicht fallen lassen
code = code.replace(
  "p.vy += 420 * dt;",
  "if ((p as any).kind !== \"smoke\") p.vy += 420 * dt;"
);

fs.writeFileSync("src/game/engine.ts", code);
console.log("ERFOLGREICH GEFLICKT");
