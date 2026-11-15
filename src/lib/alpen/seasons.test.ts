import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { autoSeason, easterSunday, fireworksOpen } from "./seasons.ts";

describe("saisonale Kalenderlogik", () => {
  it("berechnet Ostersonntag für repräsentative Jahre", () => {
    assert.equal(easterSunday(2024).toDateString(), new Date(2024, 2, 31).toDateString());
    assert.equal(easterSunday(2025).toDateString(), new Date(2025, 3, 20).toDateString());
    assert.equal(easterSunday(2026).toDateString(), new Date(2026, 3, 5).toDateString());
  });

  it("behält die Oster-Saison bis einschließlich Ostermontag", () => {
    assert.equal(autoSeason(new Date(2026, 2, 29)), "easter");
    assert.equal(autoSeason(new Date(2026, 3, 6, 23, 59, 59, 999)), "easter");
    assert.equal(autoSeason(new Date(2026, 3, 7)), "spring");
  });

  it("wechselt an den Kalendergrenzen zwischen Weihnachten, Neujahr und Winter", () => {
    assert.equal(autoSeason(new Date(2026, 11, 30)), "christmas");
    assert.equal(autoSeason(new Date(2026, 11, 31)), "newyear");
    assert.equal(autoSeason(new Date(2027, 0, 1)), "newyear");
    assert.equal(autoSeason(new Date(2027, 0, 2)), "christmas");
    assert.equal(autoSeason(new Date(2027, 0, 7)), "winter");
  });

  it("zeigt Neujahrsfeuerwerk nur von 20:00 bis 02:59 Uhr", () => {
    assert.equal(fireworksOpen(new Date(2026, 11, 31, 19, 59, 59)), false);
    assert.equal(fireworksOpen(new Date(2026, 11, 31, 20, 0)), true);
    assert.equal(fireworksOpen(new Date(2027, 0, 1, 2, 59, 59)), true);
    assert.equal(fireworksOpen(new Date(2027, 0, 1, 3, 0)), false);
  });
});
