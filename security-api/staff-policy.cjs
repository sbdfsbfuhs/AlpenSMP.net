const STAFF_ROLES = new Set(["owner", "admin", "helper", "supporter", "builder", "streamer"]);
const STAFF_NAME = /^[a-z0-9._-]{2,24}$/;

function canAccessStaffLog(method, role) {
  if (method === "GET") return role === "owner";
  return method === "POST" && STAFF_ROLES.has(role);
}

function isActiveStaffIdentity(mapping, profile, uid) {
  return (
    mapping !== null &&
    typeof mapping === "object" &&
    !Array.isArray(mapping) &&
    profile !== null &&
    typeof profile === "object" &&
    !Array.isArray(profile) &&
    typeof uid === "string" &&
    typeof mapping.username === "string" &&
    STAFF_NAME.test(mapping.username) &&
    STAFF_ROLES.has(mapping.role) &&
    mapping.disabled !== true &&
    profile.disabled !== true &&
    profile.activityConsent?.version === "staff-activity-v2" &&
    Number.isFinite(profile.activityConsent?.acceptedAt) &&
    profile.activityConsent.acceptedAt > 0 &&
    typeof profile.activityConsent.minecraftName === "string" &&
    /^[A-Za-z0-9_]{3,16}$/.test(profile.activityConsent.minecraftName) &&
    profile.uid === uid &&
    profile.role === mapping.role
  );
}

module.exports = { canAccessStaffLog, isActiveStaffIdentity };
