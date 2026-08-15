// auth.js — the identity seam. Segment 5 (nett), alongside net.js.
//
// THE ONLY FILE that may talk to the auth provider, exactly the rule net.js
// holds for `Peer`. Everything else reads AUTH and calls the four verbs below,
// and cannot tell whether a real provider or the loopback is behind them.
//
// NO SDK. Supabase auth is a plain REST API and social sign-in is a redirect:
// we send the browser to /auth/v1/authorize?provider=google, the provider and
// Supabase do the dance, and the browser comes back with tokens in the URL
// fragment. Vendoring @supabase/supabase-js to accomplish a redirect and one
// GET would add ~120 KB to a bundle whose whole promise is that it is one file
// you can double-click. The four pure functions below are the entire protocol.
//
// WHY THIS EXISTS AT ALL, since it reverses a documented decision: PRD §2 said
// zero backend, and TOOLBELT.md listed Supabase under "deliberately NOT
// invited — revisit only at online-multiplayer v3". Online multiplayer shipped,
// Shun asked for real accounts on 2026-08-15, and the amendment is recorded in
// CLAUDE.md rather than left implicit here.
//
// BUNDLE NOTE: one IIFE with every other module, so internals are prefixed `au`.

export const AUTH = {
  kind: "loopback",       // "loopback" | "supabase"
  status: "signed-out",   // "signed-out" | "pending" | "signed-in" | "unconfigured"
  user: null,             // {id, name, email, avatar, provider}
  error: null,            // last human-readable failure, for the sign-in screen
};

// Filled in from the Supabase dashboard — see AUTH-SETUP.md. The anon key is
// PUBLISHABLE and belongs in the repo: it identifies the project, authorises
// nothing on its own, and every table it can reach is governed by row-level
// security. Ordkrig commits the same class of key for the same reason. The
// service_role key is the opposite of this and must never appear here.
export const AUTH_CONFIG = Object.freeze({
  URL: "",                // e.g. https://abcdefgh.supabase.co
  ANON_KEY: "",
  PROVIDERS: ["google", "apple"],
  STORE_KEY: "ordforeren.session.v1",
});

/* Is a real provider wired up? Until Shun completes AUTH-SETUP.md this is false
   everywhere, and the app must stay fully playable rather than showing a sign-in
   screen that cannot succeed. A login wall in front of an unconfigured backend
   is how you ship a game nobody can open. */
export const authConfigured = (cfg = AUTH_CONFIG) =>
  Boolean(cfg.URL && cfg.ANON_KEY);

/**
 * Which modes need a signed-in player? Policy, so it is pure and testable
 * without a browser or a provider.
 *
 * ONLINE ONLY, and that is a deliberate reading of "required login". A login
 * wall at app start would brick two things the project promises in writing:
 * dist/Ordforeren.html, which is documented as "no Node, no server, works
 * offline" and is what `Play Ordforeren.cmd` opens, and "Én telefon", which is
 * one phone passed around a table where there is no second device to identify
 * and frequently no network at all.
 *
 * Identity is worth requiring exactly where identity means something: a room
 * with other people in it, where a rating is at stake and a name is how the
 * table knows who lied to them.
 */
export function authRequired(mode) {
  return mode === "friends" || mode === "open";
}

/**
 * Where to send the browser to sign in.
 *
 * `redirect` carries the CURRENT url, not a bare origin, so a guest who opened
 * a share link (?room=P3AZQJ) is returned to that room rather than dumped on the
 * home screen having lost the code they were invited with. That is the single
 * most likely way for this flow to be experienced, so it is the default.
 */
export function authAuthorizeUrl(provider, { cfg = AUTH_CONFIG, redirect } = {}) {
  if (!authConfigured(cfg)) return null;
  if (!cfg.PROVIDERS.includes(provider)) return null;
  const back = redirect ?? globalThis.location?.href ?? "";
  return `${cfg.URL.replace(/\/+$/, "")}/auth/v1/authorize`
    + `?provider=${encodeURIComponent(provider)}`
    + `&redirect_to=${encodeURIComponent(back)}`;
}

/**
 * Read the tokens Supabase hands back in the URL FRAGMENT.
 *
 * Fragment, not query string, and that is a security property rather than a
 * quirk: a fragment is never sent to a server and never lands in an access log
 * or a Referer header. Which is also why the caller must strip it from the
 * address bar immediately after reading — see authAdoptCallback.
 *
 * Returns null for an ordinary page load so callers can treat "no hash" and
 * "not a callback" identically.
 */
export function authParseCallback(hash = globalThis.location?.hash ?? "") {
  const raw = String(hash).replace(/^#/, "");
  if (!raw) return null;
  const p = new URLSearchParams(raw);
  const err = p.get("error_description") ?? p.get("error");
  if (err) return { error: err };
  const token = p.get("access_token");
  if (!token) return null;
  return {
    token,
    refresh: p.get("refresh_token") ?? null,
    expiresIn: Number(p.get("expires_in") ?? 0) || null,
  };
}

/**
 * The provider's user object → the shape the rest of the app already speaks.
 *
 * Google and Apple disagree about nearly every field name, and Apple withholds
 * the name entirely on every sign-in after the first, so the fallback chain
 * matters more than it looks. Email-local-part is the last resort before "?",
 * because a roster full of question marks is what this whole change was
 * partly meant to fix.
 */
export function authProfileFromUser(user) {
  if (!user) return null;
  const m = user.user_metadata ?? {};
  const email = user.email ?? m.email ?? null;
  const name =
    m.full_name || m.name || m.preferred_username
    || [m.given_name, m.family_name].filter(Boolean).join(" ").trim()
    || (email ? email.split("@")[0] : "")
    || "?";
  return {
    id: user.id,
    name: String(name).slice(0, 14),   // the roster chip is 14 chars, everywhere
    email,
    avatar: m.avatar_url || m.picture || null,
    provider: user.app_metadata?.provider ?? m.provider ?? null,
  };
}

/* ---------- the loopback: no provider, nothing leaves the device ---------- */

/* Mirrors netLoopback(). Tests and the offline bundle need an AUTH that answers
   the same questions without a network, and every screen must be reviewable in
   the gallery with no provider configured. */
export function authLoopback(user = null) {
  AUTH.kind = "loopback";
  AUTH.status = user ? "signed-in" : (authConfigured() ? "signed-out" : "unconfigured");
  AUTH.user = user;
  AUTH.error = null;
  return AUTH;
}

/* ---------- the real one ---------- */

const auStore = () => { try { return globalThis.localStorage; } catch { return null; } };

function auSaveSession(s) {
  const ls = auStore();
  if (!ls) return;
  try { s ? ls.setItem(AUTH_CONFIG.STORE_KEY, JSON.stringify(s)) : ls.removeItem(AUTH_CONFIG.STORE_KEY); }
  catch { /* private mode: the session simply does not survive a reload */ }
}

function auLoadSession() {
  const ls = auStore();
  if (!ls) return null;
  try { return JSON.parse(ls.getItem(AUTH_CONFIG.STORE_KEY) || "null"); } catch { return null; }
}

async function auFetchUser(token) {
  const r = await fetch(`${AUTH_CONFIG.URL.replace(/\/+$/, "")}/auth/v1/user`, {
    headers: { apikey: AUTH_CONFIG.ANON_KEY, Authorization: `Bearer ${token}` },
  });
  if (!r.ok) throw new Error(`user ${r.status}`);
  return r.json();
}

/**
 * Boot: adopt a fresh callback, or restore a stored session, or stay signed out.
 * Returns AUTH either way and never throws — a provider outage must degrade to
 * "signed out", never to a blank screen.
 */
export async function authBoot({ onChange } = {}) {
  if (!authConfigured()) return authLoopback(null);
  AUTH.kind = "supabase";

  const cb = authParseCallback();
  if (cb?.error) {
    AUTH.status = "signed-out"; AUTH.user = null; AUTH.error = cb.error;
    auClearHash();
    onChange?.(AUTH);
    return AUTH;
  }

  const session = cb?.token ? { token: cb.token, refresh: cb.refresh } : auLoadSession();
  // Strip the tokens from the address bar before anything can screenshot, share
  // or bookmark them. history.replaceState keeps ?room= intact, which is the
  // whole reason the redirect carried the full url out.
  if (cb?.token) { auSaveSession(session); auClearHash(); }

  if (!session?.token) { AUTH.status = "signed-out"; AUTH.user = null; onChange?.(AUTH); return AUTH; }

  AUTH.status = "pending"; onChange?.(AUTH);
  try {
    AUTH.user = authProfileFromUser(await auFetchUser(session.token));
    AUTH.status = AUTH.user ? "signed-in" : "signed-out";
    AUTH.error = null;
  } catch {
    // An expired or revoked token is indistinguishable from a dead network here,
    // and both mean the same thing to a player: sign in again.
    auSaveSession(null);
    AUTH.user = null; AUTH.status = "signed-out"; AUTH.error = "authExpired";
  }
  onChange?.(AUTH);
  return AUTH;
}

function auClearHash() {
  try {
    const { pathname, search } = globalThis.location;
    globalThis.history?.replaceState?.(null, "", pathname + search);
  } catch { /* non-browser */ }
}

export function authSignIn(provider) {
  const url = authAuthorizeUrl(provider);
  if (!url) { AUTH.error = "authUnavailable"; return false; }
  AUTH.status = "pending";
  globalThis.location.assign(url);
  return true;
}

export async function authSignOut() {
  const s = auLoadSession();
  auSaveSession(null);
  AUTH.user = null; AUTH.status = "signed-out"; AUTH.error = null;
  if (s?.token && authConfigured()) {
    // Best effort. The local session is already gone, so a failure here costs
    // the player nothing and must not block the UI.
    try {
      await fetch(`${AUTH_CONFIG.URL.replace(/\/+$/, "")}/auth/v1/logout`, {
        method: "POST",
        headers: { apikey: AUTH_CONFIG.ANON_KEY, Authorization: `Bearer ${s.token}` },
      });
    } catch { /* already signed out locally */ }
  }
  return AUTH;
}
