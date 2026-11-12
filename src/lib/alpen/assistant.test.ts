import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { answerQuestion, replyTo, resetAssistantMemory } from "./assistant.ts";

describe("AlpenKI versteht Umschreibungen", () => {
  it("20 Fragen mit Tippfehlern und Nachfragen", () => {
    const cases: Array<[string, RegExp, string?]> = [
      ["wie joine ich", /alpensmp\.net/],
      ["wie kann ich einsteigen", /alpensmp\.net/],
      ["connecten auf den server", /Bedrock|alpensmp\.net/],
      ["sodum erlaubt?", /Sodium|erlaubt/],
      ["ist xray erlaubt", /Nein/],
      ["killaura geht das", /Nein/],
      ["claimes wie funktionieren die", /Claim|1000/],
      ["port fur bedrock", /19132/],
      ["welche version", /1\.21\.11/],
      ["wer ist der owner", /SwissRed/],
      ["wo wohnt swissred", /nicht/],
      ["hallo", /AlpenKI/],
      ["wie gehts", /gut|AlpenKI/],
      ["danke", /Gern/],
      ["wer bist du", /automatischer|Maskottchen|AlpenKI/],
      ["ist discord pflicht", /nicht Pflicht/],
      ["live karte", /voll|Pause|zu/],
      ["team prefix farbe", /\/team prefix/],
      ["team prefix ohne team", /nicht/],
      ["wie erstelle ich ein team", /\/team create/],
      ["team home cooldown", /120/],
      ["whitelist?", /nicht/],
      ["darf ich cracked", /nicht im Regelwerk|Discord/],
      ["wie backe ich einen kuchen", /nicht bei mir/],
    ];
    for (const [question, pattern] of cases) {
      resetAssistantMemory();
      const text = answerQuestion(question);
      assert.match(text, pattern, question);
    }
  });

  it("merkt sich das letzte Thema", () => {
    resetAssistantMemory();
    answerQuestion("wie joine ich mit java");
    const follow = answerQuestion("und auf bedrock?");
    assert.match(follow, /19132/);
    answerQuestion("was ist die ip");
    const port = answerQuestion("was ist mit dem port?");
    assert.match(port, /19132|25565/);
  });

  it("bietet sichere Links an, wenn eine Frage nicht beantwortet werden kann", () => {
    resetAssistantMemory();
    const reply = replyTo("erzähl mir von dinosauriern");
    assert.match(reply.text, /nicht bei mir/);
    assert.ok(reply.actions.some((item) => item.label === "IP"));
    assert.ok(reply.actions.some((item) => item.label === "Regeln"));
    assert.ok(reply.actions.some((item) => /Discord/.test(item.label)));
  });

  it("findet passende Inhalte mit Synonymen und kurzen Umschreibungen", () => {
    const cases: Array<[string, RegExp]> = [
      ["wie verbinde ich mich mit dem server", /alpensmp\.net/],
      ["wie schütze ich mein grundstück", /Claim|1000/],
      ["wie gründe ich eine gruppe", /\/team create/],
      ["welche kommandos gibt es", /\/spawn|\/sethome|Guide/],
      ["was passiert wenn ich sterbe und items verliere", /Todesgrab|Items/],
    ];
    for (const [question, pattern] of cases) {
      resetAssistantMemory();
      assert.match(answerQuestion(question), pattern, question);
    }
  });

  it("rät bei mehreren nicht passenden Begriffen nicht ins Blaue", () => {
    resetAssistantMemory();
    assert.match(answerQuestion("wie funktioniert die dinosaurier forschung"), /steht so nicht/);
  });
});
