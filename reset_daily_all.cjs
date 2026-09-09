const SUPA_URL = "https://lforuvtpskrnydlburpt.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxmb3J1dnRwc2tybnlkbGJ1cnB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4NjAwMDQsImV4cCI6MjEwMzQzNjAwNH0.dXH7H7VhUPYNcMSGztdJT9L6CYZrnJEdj75xAXo0RPY";

async function resetAllDaily() {
  console.log("🔄 Lade alle Accounts aus Supabase...");

  const res = await fetch(`${SUPA_URL}/rest/v1/accounts?select=id,username,stats`, {
    headers: {
      apikey: SUPA_KEY,
      Authorization: `Bearer ${SUPA_KEY}`
    }
  });

  if (!res.ok) {
    console.error("❌ Fehler beim Laden der Accounts:", res.statusText);
    return;
  }

  const accounts = await res.json();
  console.log(`📦 Gefunden: ${accounts.length} Accounts.`);

  let resetCount = 0;

  for (const acc of accounts) {
    const rawStats = acc.stats || {};
    const updatedStats = { ...rawStats };

    // 1. Daily-Reward auf Null setzen (Start bei Tag 1)
    updatedStats.dailyReward = null;

    // 2. Tauben-Badge entfernen, falls durch Durchklicken erhalten
    if (Array.isArray(updatedStats.inventory)) {
      updatedStats.inventory = updatedStats.inventory.filter((id) => id !== "badge_tauben");
    }
    if (updatedStats.equipped && updatedStats.equipped.badge === "badge_tauben") {
      delete updatedStats.equipped.badge;
    }

    const patchRes = await fetch(`${SUPA_URL}/rest/v1/accounts?id=eq.${acc.id}`, {
      method: "PATCH",
      headers: {
        apikey: SUPA_KEY,
        Authorization: `Bearer ${SUPA_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      },
      body: JSON.stringify({ stats: updatedStats })
    });

    if (patchRes.ok) {
      console.log(`  ✓ Zurückgesetzt: ${acc.username}`);
      resetCount++;
    } else {
      console.warn(`  ⚠️ Konnte ${acc.username} nicht aktualisieren`);
    }
  }

  console.log(`\n🎉 Fertig! ${resetCount} von ${accounts.length} Accounts wurden auf Tag 1 zurückgesetzt.`);
}

resetAllDaily();
