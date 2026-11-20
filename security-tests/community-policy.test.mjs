import assert from "node:assert/strict";
import test from "node:test";
import policy from "../security-api/community-policy.cjs";

const imageUrl = "data:image/jpeg;base64,/9j/4AAQSkZJRg==";

test("public collections expose only explicitly approved and consented items", () => {
  const reviews = policy.filterPublicCommunityCollection("community_reviews", {
    approved: { status: "approved", publicationConsent: true, text: "ok" },
    pending: { status: "pending", publicationConsent: true },
    rejected: { status: "rejected", publicationConsent: true },
    legacy: { status: "approved", text: "no consent record" },
    declined: { status: "approved", publicationConsent: false },
  });
  assert.deepEqual(Object.keys(reviews), ["approved"]);
  assert.equal(policy.getPublicCommunityValue("community_reviews", reviews, ["approved", "text"]), "ok");
  assert.equal(policy.getPublicCommunityValue("community_reviews", reviews, ["legacy"]), null);

  const images = policy.filterPublicCommunityCollection("community_images", {
    approved: {
      status: "approved",
      publicationConsent: true,
      imageRightsConfirmed: true,
      imageUrl,
    },
    noRights: { status: "approved", publicationConsent: true, imageRightsConfirmed: false, imageUrl },
    legacy: { status: "approved", publicationConsent: true, imageUrl },
  });
  assert.deepEqual(Object.keys(images), ["approved"]);
});

test("public review submissions cannot set server-controlled fields", () => {
  const submitted = policy.createPublicCommunitySubmission(
    "community_reviews",
    {
      name: "TestPlayer",
      text: "Gutes Erlebnis",
      rating: 5,
      kind: "review",
      submissionAcknowledged: true,
      consent: { publication: true },
    },
    123,
  );
  assert.equal(submitted.status, "pending");
  assert.equal(submitted.ts, 123);
  assert.equal(submitted.publicationConsent, true);
  assert.equal(submitted.publicationConsentAt, 123);
  assert.equal(submitted.source, "website");

  for (const field of ["status", "moderatedBy", "moderatedAt", "publicationConsent", "ts", "source"]) {
    assert.throws(
      () =>
        policy.createPublicCommunitySubmission("community_reviews", {
          name: "TestPlayer",
          text: "Gutes Erlebnis",
          rating: 5,
          kind: "review",
          submissionAcknowledged: true,
          consent: { publication: true },
          [field]: "approved",
        }),
      /invalid_submission_fields/,
      field,
    );
  }
  assert.throws(
    () =>
      policy.createPublicCommunitySubmission("community_reviews", {
        name: "TestPlayer",
        text: "Gutes Erlebnis",
        rating: 5,
        kind: "review",
        submissionAcknowledged: false,
        consent: { publication: true },
      }),
    /invalid_submission/,
  );
  assert.throws(
    () =>
      policy.createPublicCommunitySubmission("community_reviews", {
        name: "TestPlayer",
        text: "Gutes Erlebnis",
        rating: 5,
        kind: "review",
        submissionAcknowledged: true,
        consent: { publication: true, imageRights: true },
      }),
    /invalid_submission_fields/,
  );
});

test("image submissions record the choices but remain pending", () => {
  const submitted = policy.createPublicCommunitySubmission(
    "community_images",
    {
      name: "TestPlayer",
      caption: "Spawn",
      imageUrl,
      kind: "image",
      submissionAcknowledged: true,
      consent: { publication: false, imageRights: true },
    },
    456,
  );
  assert.equal(submitted.status, "pending");
  assert.equal(submitted.publicationConsent, false);
  assert.equal(submitted.imageRightsConfirmed, true);
  assert.equal(submitted.publicationConsentAt, null);
  assert.throws(
    () =>
      policy.createPublicCommunitySubmission("community_images", {
        name: "TestPlayer",
        caption: "",
        imageUrl: "https://example.invalid/image.jpg",
        kind: "image",
        submissionAcknowledged: true,
        consent: { publication: true, imageRights: true },
      }),
    /invalid_image/,
  );
  assert.throws(
    () =>
      policy.createPublicCommunitySubmission("community_images", {
        name: "TestPlayer",
        caption: "",
        imageUrl,
        kind: "image",
        submissionAcknowledged: true,
        consent: { publication: true },
      }),
    /invalid_image/,
  );
});

test("moderation is limited to status and records the authenticated active moderator", () => {
  const current = {
    name: "TestPlayer",
    text: "Gutes Erlebnis",
    status: "pending",
    publicationConsent: true,
    submissionAcknowledged: true,
  };
  const approved = policy.moderateCommunityItem(
    "community_reviews",
    current,
    { status: "approved" },
    { username: "moderator", role: "helper" },
    789,
  );
  assert.equal(approved.moderatedBy, "moderator");
  assert.equal(approved.moderatedAt, 789);
  assert.equal(approved.status, "approved");
  assert.equal(approved.text, current.text);

  assert.throws(
    () =>
      policy.moderateCommunityItem(
        "community_reviews",
        { ...current, publicationConsent: undefined },
        { status: "approved" },
        { username: "moderator", role: "helper" },
      ),
    /invalid_moderation/,
  );
  assert.throws(
    () =>
      policy.moderateCommunityItem(
        "community_reviews",
        current,
        { status: "approved", moderatedBy: "forged" },
        { username: "moderator", role: "helper" },
      ),
    /invalid_moderation/,
  );
  assert.throws(
    () =>
      policy.moderateCommunityItem(
        "community_reviews",
        current,
        { status: "approved" },
        { username: "paused", role: "owner", disabled: true },
      ),
    /invalid_moderation/,
  );
});

test("community write policy separates moderation from deletion", () => {
  const roles = ["owner", "admin", "helper", "supporter"];
  for (const role of roles) {
    assert.equal(policy.canWriteCommunity("PATCH", { role }, 2), true, role);
  }
  for (const role of ["builder", "streamer", "unknown"]) {
    assert.equal(policy.canWriteCommunity("PATCH", { role }, 2), false, role);
  }
  for (const role of ["owner", "admin"]) {
    assert.equal(policy.canWriteCommunity("DELETE", { role }, 2), true, role);
    assert.equal(policy.canWriteCommunity("DELETE", { role }, 1), false, role);
  }
  for (const role of ["helper", "supporter", "builder", "streamer"]) {
    assert.equal(policy.canWriteCommunity("DELETE", { role }, 2), false, role);
  }
  assert.equal(policy.canWriteCommunity("PATCH", { role: "owner", disabled: true }, 2), false);
  assert.equal(policy.canWriteCommunity("DELETE", { role: "owner", disabled: true }, 2), false);
});

test("staff log identity and timestamp come from the server actor", () => {
  assert.deepEqual(
    policy.createStaffLogEntry(
      { action: "Rolle geändert", detail: "helper -> admin" },
      { username: "owner", role: "owner" },
      900,
    ),
    { by: "owner", action: "Rolle geändert", detail: "helper -> admin", ts: 900 },
  );
  assert.throws(
    () =>
      policy.createStaffLogEntry(
        { by: "forged", action: "Role changed", ts: 1 },
        { username: "owner", role: "owner" },
      ),
    /invalid_staff_log/,
  );
  assert.throws(
    () =>
      policy.createStaffLogEntry(
        { action: "Role changed" },
        { username: "paused", role: "owner", disabled: true },
      ),
    /invalid_staff_log/,
  );
  assert.throws(
    () =>
      policy.createStaffLogEntry(
        { action: "Forged account deletion", detail: "arbitrary event" },
        { username: "helper", role: "helper" },
      ),
    /invalid_staff_log/,
  );
});
