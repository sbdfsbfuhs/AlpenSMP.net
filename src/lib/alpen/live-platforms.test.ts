import assert from "node:assert/strict";
import test from "node:test";
import { liveStreamDestinations, normalizeStreamPlatforms } from "./live-platforms.ts";

test("normalizes selected stream platforms without duplicates or unknown values", () => {
  assert.deepEqual(normalizeStreamPlatforms(["twitch", "youtube", "twitch", "unknown"]), ["twitch", "youtube"]);
  assert.deepEqual(normalizeStreamPlatforms([], "kick"), ["kick"]);
});

test("returns a separate website destination for every selected live platform", () => {
  assert.deepEqual(
    liveStreamDestinations({
      platform: "twitch",
      platforms: ["twitch", "youtube"],
      url: "https://twitch.tv/alpen",
      platformLinks: {
        twitch: "https://twitch.tv/alpen",
        youtube: "https://youtube.com/@alpen/live",
      },
    }),
    [
      { id: "twitch", label: "Twitch", url: "https://twitch.tv/alpen" },
      { id: "youtube", label: "YouTube", url: "https://youtube.com/@alpen/live" },
    ],
  );
});

test("keeps older single-platform live records working", () => {
  assert.deepEqual(
    liveStreamDestinations({ platform: "kick", url: "https://kick.com/alpen" }),
    [{ id: "kick", label: "Kick", url: "https://kick.com/alpen" }],
  );
});
