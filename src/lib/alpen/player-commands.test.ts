import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  mergeLegacyCommands,
  parseCommandCatalog,
  seedCommandGroups,
  toPlayerCommandCatalog,
} from "./player-commands.ts";

describe("player command catalog", () => {
  it("merges the Java and Bedrock legacy lists without duplicating base commands", () => {
    const groups = mergeLegacyCommands(
      null,
      {
        oldJava: { cmd: "/custom Spieler", text: "Custom Java command" },
      },
      {
        oldBedrock: { cmd: "/custom .Spieler", text: "Custom Bedrock command" },
      },
    );
    const custom = groups.find((group) => group.id === "weitere")?.rows[0];
    assert.equal(custom?.cmd, "/custom Spieler");
    assert.equal(custom?.bedrockCmd, "/custom .Spieler");
    assert.equal(custom?.text, "Custom Bedrock command");
    assert.equal(groups.filter((group) => group.id === "claims").length, 1);
  });

  it("preserves empty groups in a saved catalog so deleted commands stay deleted", () => {
    const emptyGroup = { ...seedCommandGroups()[0], rows: [] };
    const saved = toPlayerCommandCatalog([emptyGroup], "owner");
    assert.deepEqual(parseCommandCatalog(saved), [emptyGroup]);
  });

  it("falls back to the seeded commands for an absent catalog", () => {
    assert.deepEqual(mergeLegacyCommands(null, null, null), seedCommandGroups());
  });
});
