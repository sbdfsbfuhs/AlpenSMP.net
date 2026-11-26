import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isMinecraftPlayersResponse,
  minecraftNameVerificationErrorMessage,
  minecraftPlayersSnapshot,
  suggestMinecraftPlayers,
} from "./minecraft.ts";

describe("Minecraft-Spieler- und Bannlisten", () => {
  it("behält permanente Banns ohne Grund als aktive Banns", () => {
    const response = {
      players: ["Alex"],
      bans: [{ name: "Alex", uuid: "uuid-1", created: "2026-11-07T10:00:00.000Z", reason: null, expires: null }],
    };

    assert.equal(isMinecraftPlayersResponse(response), true);
    assert.deepEqual(minecraftPlayersSnapshot(response), {
      players: ["Alex"],
      bans: [{
        name: "Alex",
        reason: "–",
        until: "Permanent",
        uuid: "uuid-1",
        created: "2026-11-07T10:00:00.000Z",
        source: "",
      }],
    });
  });

  it("nimmt gebannte Spieler auch ohne separaten Spielereintrag in die Vorschläge auf", () => {
    const snapshot = minecraftPlayersSnapshot({
      players: [],
      bans: [{ name: "BannedPlayer", expires: "2027-01-01T00:00:00.000Z" }],
    });

    assert.deepEqual(snapshot.players, ["BannedPlayer"]);
    assert.equal(snapshot.bans[0]?.until, "2027-01-01T00:00:00.000Z");
  });

  it("findet Spielernamen ohne Beachtung der Großschreibung auch innerhalb des Namens", () => {
    assert.deepEqual(
      suggestMinecraftPlayers("lex", ["Alex", "Lexi", "alex", "PlayerLex"]),
      ["Lexi", "Alex", "PlayerLex"],
    );
  });

  it("entfernt doppelte Vorschläge und begrenzt die Ergebnisliste", () => {
    assert.deepEqual(
      suggestMinecraftPlayers("", ["Alex", "alex", "Bee", "Casey"], 2),
      ["Alex", "Bee"],
    );
  });

  it("weist fehlerhafte API-Antworten zurück, statt sie als leere Bannliste zu behandeln", () => {
    for (const response of [
      { players: [], bans: null },
      { players: [], bans: [{ name: "" }] },
      { players: [{ name: "Alex" }], bans: [] },
      { players: [], bans: [{ name: "Alex", expires: 123 }] },
    ]) {
      assert.equal(isMinecraftPlayersResponse(response), false);
    }
  });

  it("zeigt den erklärenden Fehler der Minecraft-Prüf-API statt nur einen Statuscode", () => {
    assert.equal(
      minecraftNameVerificationErrorMessage(
        { error: "Der Minecraft-Nachweisindex konnte nicht gelesen werden." },
        503,
      ),
      "Der Minecraft-Nachweisindex konnte nicht gelesen werden.",
    );
    assert.equal(
      minecraftNameVerificationErrorMessage({ error: "  " }, 503),
      "Die Minecraft-Serverhistorie konnte nicht geprüft werden (503).",
    );
  });
});
