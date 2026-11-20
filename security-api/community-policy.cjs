const REVIEW_ROOT = "community_reviews";
const IMAGE_ROOT = "community_images";
const STAFF_LOG_ACTIONS = new Set([
  "Account angelegt",
  "Rolle geändert",
  "Account pausiert",
  "Account freigegeben",
  "Passwort zurückgesetzt",
  "Passwort-Setup-Link gesendet",
  "E-Mail-Adresse aktualisiert",
  "Account gelöscht",
  "Login",
  "Banngrund ergänzt",
  "Ban",
  "Warnung",
  "Minecraft-Bann",
  "Notiz",
  "Minecraft-Entbann",
]);

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isPublicCommunityItem(root, item) {
  if (!isRecord(item) || item.status !== "approved" || item.publicationConsent !== true) {
    return false;
  }
  if (root === IMAGE_ROOT) {
    return item.imageRightsConfirmed === true && typeof item.imageUrl === "string";
  }
  return root === REVIEW_ROOT;
}

function filterPublicCommunityCollection(root, collection) {
  if (!isRecord(collection) || (root !== REVIEW_ROOT && root !== IMAGE_ROOT)) return {};
  return Object.fromEntries(
    Object.entries(collection).filter(([, item]) => isPublicCommunityItem(root, item)),
  );
}

function getPublicCommunityValue(root, collection, suffix = []) {
  let value = filterPublicCommunityCollection(root, collection);
  for (const part of suffix) {
    if (!isRecord(value) || !Object.hasOwn(value, part)) return null;
    value = value[part];
  }
  return value;
}

function createPublicCommunitySubmission(root, body, now = Date.now()) {
  if (!isRecord(body) || body.submissionAcknowledged !== true) {
    throw new TypeError("invalid_submission");
  }
  if (typeof body.name !== "string" || body.name.trim().length < 2 || body.name.length > 32) {
    throw new TypeError("invalid_name");
  }
  if (!isRecord(body.consent)) throw new TypeError("invalid_consent");
  const consentKeys = Object.keys(body.consent);
  if (
    consentKeys.some((key) => key !== "publication" && key !== "imageRights") ||
    typeof body.consent.publication !== "boolean"
  ) {
    throw new TypeError("invalid_consent");
  }

  if (root === REVIEW_ROOT) {
    const allowed = new Set([
      "name",
      "text",
      "rating",
      "kind",
      "submissionAcknowledged",
      "consent",
    ]);
    if (
      Object.keys(body).some((key) => !allowed.has(key)) ||
      consentKeys.some((key) => key !== "publication")
    ) {
      throw new TypeError("invalid_submission_fields");
    }
    if (
      typeof body.text !== "string" ||
      body.text.trim().length < 4 ||
      body.text.length > 800 ||
      !Number.isInteger(body.rating) ||
      body.rating < 1 ||
      body.rating > 5 ||
      (body.kind !== "review" && body.kind !== "both")
    ) {
      throw new TypeError("invalid_review");
    }
    return {
      name: body.name.trim(),
      text: body.text.trim(),
      rating: body.rating,
      kind: body.kind,
      status: "pending",
      ts: now,
      submissionAcknowledged: true,
      publicationConsent: body.consent.publication,
      publicationConsentAt: body.consent.publication ? now : null,
      source: "website",
    };
  }

  if (root === IMAGE_ROOT) {
    const allowed = new Set([
      "name",
      "caption",
      "imageUrl",
      "kind",
      "submissionAcknowledged",
      "consent",
    ]);
    if (
      Object.keys(body).some((key) => !allowed.has(key)) ||
      typeof body.caption !== "string" ||
      body.caption.length > 120 ||
      (body.kind !== "image" && body.kind !== "both") ||
      typeof body.consent.imageRights !== "boolean" ||
      typeof body.imageUrl !== "string" ||
      body.imageUrl.length > 720_000 ||
      !/^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(body.imageUrl)
    ) {
      throw new TypeError("invalid_image");
    }
    return {
      name: body.name.trim(),
      caption: body.caption.trim(),
      imageUrl: body.imageUrl,
      kind: body.kind,
      status: "pending",
      ts: now,
      submissionAcknowledged: true,
      publicationConsent: body.consent.publication,
      publicationConsentAt: body.consent.publication ? now : null,
      imageRightsConfirmed: body.consent.imageRights,
      source: "website",
    };
  }

  throw new TypeError("invalid_community_root");
}

function moderateCommunityItem(root, current, body, actor, now = Date.now()) {
  if (
    (root !== REVIEW_ROOT && root !== IMAGE_ROOT) ||
    !isRecord(current) ||
    !isRecord(body) ||
    Object.keys(body).length !== 1 ||
    (body.status !== "approved" && body.status !== "rejected") ||
    !actor ||
    actor.disabled === true ||
    typeof actor.username !== "string" ||
    (body.status === "approved" && !isPublicCommunityItem(root, { ...current, status: "approved" }))
  ) {
    throw new TypeError("invalid_moderation");
  }
  return {
    ...current,
    status: body.status,
    moderatedBy: actor.username,
    moderatedAt: now,
    updatedAt: now,
  };
}

function createStaffLogEntry(body, actor, now = Date.now()) {
  if (
    !isRecord(body) ||
    Object.keys(body).some((key) => key !== "action" && key !== "detail") ||
    typeof body.action !== "string" ||
    !STAFF_LOG_ACTIONS.has(body.action) ||
    body.action.length > 80 ||
    (body.detail !== undefined && typeof body.detail !== "string") ||
    (typeof body.detail === "string" && body.detail.length > 180) ||
    !actor ||
    actor.disabled === true ||
    typeof actor.username !== "string" ||
    !actor.username
  ) {
    throw new TypeError("invalid_staff_log");
  }
  return {
    by: actor.username,
    action: body.action.trim(),
    detail: typeof body.detail === "string" ? body.detail : "",
    ts: now,
  };
}

function canWriteCommunity(method, actor, pathDepth) {
  if (!actor || actor.disabled === true) return false;
  if (
    method === "PATCH" &&
    ["owner", "admin", "helper", "supporter"].includes(actor.role)
  ) {
    return pathDepth === 2;
  }
  if (method === "DELETE") {
    return pathDepth === 2 && ["owner", "admin"].includes(actor.role);
  }
  return false;
}

module.exports = {
  canWriteCommunity,
  createPublicCommunitySubmission,
  createStaffLogEntry,
  filterPublicCommunityCollection,
  getPublicCommunityValue,
  isPublicCommunityItem,
  moderateCommunityItem,
};
