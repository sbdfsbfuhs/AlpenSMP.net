"use strict";

const STAFF_NAME = /^[a-z0-9._-]{2,24}$/;
const MAX_HEARTBEAT_GAP_MS = 45_000;
const DAILY_RETENTION_DAYS = 30;
const TOTAL_RETENTION_DAYS = 365;

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function dateKey(timestamp) {
  return new Date(timestamp).toISOString().slice(0, 10);
}

function shiftDate(key, days) {
  const date = new Date(`${key}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function weekStart(key) {
  const date = new Date(`${key}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
  return date.toISOString().slice(0, 10);
}

function normalizeActivity(value) {
  if (value === null) return { version: 1, members: Object.create(null) };
  if (!isRecord(value) || value.version !== 1 || !isRecord(value.members)) {
    throw new TypeError("Invalid staff activity data");
  }
  const members = Object.create(null);
  for (const [username, member] of Object.entries(value.members)) {
    if (!STAFF_NAME.test(username) || !isRecord(member) || !isRecord(member.website)) {
      throw new TypeError("Invalid staff activity member");
    }
    const source = member.website;
    if (!isRecord(source.daily) || !isRecord(source.weekly)) {
      throw new TypeError("Invalid staff activity buckets");
    }
    const daily = Object.create(null);
    for (const [day, seconds] of Object.entries(source.daily)) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !Number.isFinite(seconds) || seconds < 0) {
        throw new TypeError("Invalid daily activity bucket");
      }
      daily[day] = seconds;
    }
    const weekly = Object.create(null);
    for (const [week, seconds] of Object.entries(source.weekly)) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(week) || !Number.isFinite(seconds) || seconds < 0) {
        throw new TypeError("Invalid weekly activity bucket");
      }
      weekly[week] = seconds;
    }
    members[username] = {
      website: {
        daily,
        weekly,
        lastHeartbeatAt: Number.isSafeInteger(source.lastHeartbeatAt)
          ? source.lastHeartbeatAt
          : 0,
      },
    };
  }
  return { version: 1, members };
}

function compactMember(member, now) {
  const today = dateKey(now);
  const dailyCutoff = shiftDate(today, -(DAILY_RETENTION_DAYS - 1));
  const totalCutoff = shiftDate(today, -(TOTAL_RETENTION_DAYS - 1));
  for (const [day, seconds] of Object.entries(member.daily)) {
    if (day >= dailyCutoff) continue;
    const week = weekStart(day);
    if (day >= totalCutoff && week >= totalCutoff) {
      member.weekly[week] = (member.weekly[week] || 0) + seconds;
    }
    delete member.daily[day];
  }
  for (const week of Object.keys(member.weekly)) {
    if (week < totalCutoff) delete member.weekly[week];
  }
}

function pruneStaffActivity(value, now = Date.now()) {
  const activity = normalizeActivity(value);
  for (const member of Object.values(activity.members)) compactMember(member.website, now);
  return activity;
}

function removeTrackedStaffEntry(text, username) {
  if (!STAFF_NAME.test(username)) throw new TypeError("Invalid staff username");
  const lines = String(text).split(/\r?\n/);
  if (lines[0] !== "v1") throw new TypeError("Invalid staff allowlist");
  const members = new Map();
  for (const line of lines.slice(1)) {
    if (!line) continue;
    const [name, minecraftName, extra] = line.split("\t");
    if (
      extra !== undefined ||
      !STAFF_NAME.test(name || "") ||
      !/^[A-Za-z0-9_]{3,16}$/.test(minecraftName || "") ||
      members.has(name)
    ) throw new TypeError("Invalid staff allowlist entry");
    members.set(name, minecraftName);
  }
  const removed = members.delete(username);
  return {
    removed,
    text: ["v1", ...[...members].map(([name, minecraftName]) => `${name}\t${minecraftName}`)].join("\n") + "\n",
  };
}

function recordStaffActivityHeartbeat(value, username, now = Date.now()) {
  if (!STAFF_NAME.test(username) || !Number.isSafeInteger(now) || now <= 0) {
    throw new TypeError("Invalid staff activity heartbeat");
  }
  const activity = pruneStaffActivity(value, now);
  const member =
    activity.members[username] ||
    (activity.members[username] = {
      website: { daily: Object.create(null), weekly: Object.create(null), lastHeartbeatAt: 0 },
    });
  const website = member.website;
  const elapsed = now >= website.lastHeartbeatAt && now - website.lastHeartbeatAt <= MAX_HEARTBEAT_GAP_MS
    ? now - website.lastHeartbeatAt
    : 0;
  if (elapsed > 0) {
    let cursor = now - elapsed;
    while (cursor < now) {
      const end = Math.min(now, Date.parse(`${shiftDate(dateKey(cursor), 1)}T00:00:00.000Z`));
      const key = dateKey(cursor);
      website.daily[key] = (website.daily[key] || 0) + (end - cursor) / 1000;
      cursor = end;
    }
  }
  website.lastHeartbeatAt = now;
  compactMember(website, now);
  return activity;
}

module.exports = {
  DAILY_RETENTION_DAYS,
  MAX_HEARTBEAT_GAP_MS,
  TOTAL_RETENTION_DAYS,
  normalizeActivity,
  pruneStaffActivity,
  recordStaffActivityHeartbeat,
  removeTrackedStaffEntry,
};
