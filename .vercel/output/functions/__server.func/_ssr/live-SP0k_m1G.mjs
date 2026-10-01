import { u as SITE } from "./shell-DzkNWVRk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/live-SP0k_m1G.js
async function fetchStatus() {
	const res = await fetch(`https://api.mcsrvstat.us/3/${SITE.ip}`);
	if (!res.ok) throw new Error("Status nicht erreichbar");
	const data = await res.json();
	return {
		online: Boolean(data.online),
		players: data.players?.online ?? 0,
		max: data.players?.max ?? 0,
		version: data.version || SITE.version,
		software: data.software || "Paper",
		motd: data.motd?.clean?.filter(Boolean) ?? []
	};
}
async function fetchDiscordCount() {
	const res = await fetch(`https://discord.com/api/v9/invites/${SITE.discordCode}?with_counts=true`);
	if (!res.ok) return null;
	const data = await res.json();
	return typeof data.approximate_member_count === "number" ? data.approximate_member_count : null;
}
async function fetchSiteStats() {
	const res = await fetch(`${SITE.fb}/site_stats.json`);
	if (!res.ok) return {
		total: null,
		listed: null
	};
	const data = await res.json();
	return {
		total: typeof data?.total_players_ever === "number" ? data.total_players_ever : null,
		listed: typeof data?.current_players === "number" ? data.current_players : null
	};
}
async function fetchHistory() {
	const res = await fetch(`${SITE.fb}/site_stats_history.json?orderBy="$key"&limitToLast=900`);
	if (!res.ok) return [];
	const data = await res.json();
	if (!data) return [];
	return Object.values(data).map((row) => ({
		t: Number(row.t) || 0,
		n: Number(row.n) || 0
	})).filter((row) => row.t > 0).sort((a, b) => a.t - b.t);
}
async function fetchReviews() {
	const res = await fetch(`${SITE.fb}/community_reviews.json`);
	if (!res.ok) return [];
	const data = await res.json();
	if (!data) return [];
	return Object.values(data).filter((row) => row && row.status === "approved" && row.text).map((row) => ({
		name: row.name || "Spieler",
		rating: Number(row.rating) || 5,
		text: String(row.text),
		ts: Number(row.ts) || 0
	})).sort((a, b) => b.ts - a.ts);
}
async function fetchShots() {
	const res = await fetch(`${SITE.fb}/community_images.json`);
	if (!res.ok) return [];
	const data = await res.json();
	if (!data) return [];
	return Object.values(data).filter((row) => row && row.status === "approved" && row.imageUrl).map((row) => ({
		name: row.name || "Community",
		caption: row.caption || "",
		imageUrl: row.imageUrl,
		ts: Number(row.ts) || 0
	})).sort((a, b) => b.ts - a.ts);
}
async function submitCommunity(body) {
	const base = {
		name: body.name,
		text: body.text,
		rating: body.rating,
		kind: body.kind,
		imageUrl: body.imageUrl,
		status: "pending",
		ts: Date.now(),
		source: "website"
	};
	if (body.kind === "review" || body.kind === "both") {
		if (!(await fetch(`${SITE.fb}/community_reviews.json`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(base)
		})).ok) throw new Error("Rezension konnte nicht gespeichert werden.");
	}
	if ((body.kind === "image" || body.kind === "both") && body.imageUrl) {
		if (!(await fetch(`${SITE.fb}/community_images.json`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				name: body.name,
				caption: body.text.slice(0, 120),
				imageUrl: body.imageUrl,
				status: "pending",
				ts: Date.now()
			})
		})).ok) throw new Error("Bild konnte nicht gespeichert werden.");
	}
}
async function submitTicket(input) {
	const code = "ALP-" + Math.random().toString(36).slice(2, 6).toUpperCase();
	const help = await fetch(`${SITE.fb}/helpRequests.json`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			by: input.name,
			msg: (input.topic ? `[${input.topic}] ` : "") + input.msg,
			ts: Date.now(),
			source: "website",
			replies: {},
			ticketCode: code
		})
	});
	if (!help.ok) throw new Error("Ticket konnte nicht gesendet werden.");
	const pushed = await help.json();
	if (!(await fetch(`${SITE.fb}/tickets/${code}.json`, {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			name: input.name,
			topic: input.topic,
			msg: input.msg,
			ts: Date.now(),
			replies: {},
			status: "offen",
			helpKey: pushed.name || ""
		})
	})).ok) throw new Error("Ticket-Code konnte nicht angelegt werden.");
	return code;
}
async function lookupTicket(code) {
	const clean = code.trim().toUpperCase();
	const res = await fetch(`${SITE.fb}/tickets/${encodeURIComponent(clean)}.json`);
	if (!res.ok) return null;
	const data = await res.json();
	if (!data) return null;
	const replies = data.replies ? Object.values(data.replies).map((row) => ({
		by: row.by || "Team",
		text: row.text || row.msg || "",
		ts: Number(row.ts) || 0
	})) : [];
	return {
		code: clean,
		status: data.status || "offen",
		topic: data.topic || "",
		msg: data.msg || "",
		replies: replies.filter((row) => row.text)
	};
}
//#endregion
export { fetchSiteStats as a, submitCommunity as c, fetchShots as i, submitTicket as l, fetchHistory as n, fetchStatus as o, fetchReviews as r, lookupTicket as s, fetchDiscordCount as t };
