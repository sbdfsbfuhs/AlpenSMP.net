import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isMinecraftPlayersResponse, minecraftPlayersSnapshot } from "./minecraft.ts";

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
});
