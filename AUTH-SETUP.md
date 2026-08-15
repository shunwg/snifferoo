# AUTH-SETUP.md — turning sign-in on

The code is written and tested. **Nothing is gated until this file is completed**, by design:
`authConfigured()` returns false while `AUTH_CONFIG` is empty, `authGate()` becomes a no-op, and the
game plays exactly as it did before. A login wall in front of a backend that cannot answer is the one
failure with no way out, so the switch is the config, not the code.

Everything below has to be done by a human in three web consoles. None of it can be automated from
here: it needs accounts, and two of the three ask for a card.

**Do Pages first.** Google and Apple both refuse to register a redirect against an origin that
returns 404, so `https://shunwg.github.io/ordforeren/` has to be live before step 2.
Repo → Settings → Pages → Source → **GitHub Actions**, then re-run the failed deploy.

---

## 1. Supabase — the backend that holds the profile (free, ~5 min)

1. [supabase.com](https://supabase.com) → sign in with GitHub → **New project**.
   Name `ordforeren`, region **West EU (Ireland)** — closest to Norwegian players, and keeps the data
   in the EEA, which is the answer you want when someone asks where the profiles live.
2. Wait for provisioning, then **Project Settings → API** and copy two values:
   - **Project URL** → `https://<something>.supabase.co`
   - **anon / public** key → a long `eyJ…` string
3. Paste both into `Lab/js/auth.js` → `AUTH_CONFIG`:
   ```js
   URL: "https://<something>.supabase.co",
   ANON_KEY: "eyJ…",
   ```
   **The anon key belongs in the repo.** It is publishable, identifies the project, authorises
   nothing on its own, and every table it reaches is governed by row-level security — `ordkrig`
   commits the same class of key for the same reason. The **`service_role`** key on that same page is
   the exact opposite: it bypasses RLS entirely. It must never be pasted anywhere in this repo, and
   if it ever is, rotate it in the dashboard rather than just deleting the line.
4. **Authentication → URL Configuration**:
   - Site URL: `https://shunwg.github.io/ordforeren/`
   - Additional redirect URLs: `http://localhost:8787/Lab/` (so the Lab works while developing)

## 2. Google — free, ~10 min

1. [console.cloud.google.com](https://console.cloud.google.com) → new project `ordforeren`.
2. **APIs & Services → OAuth consent screen** → External → app name `Ordføreren`, your support email,
   and a developer email. Scopes: leave the defaults (`email`, `profile`, `openid`) — the app reads
   nothing else, and asking for more is how a consent screen starts frightening people.
   While it is in **Testing** only accounts you list can sign in; hit **Publish** when you want the
   room open to anyone. No verification review is needed for these three basic scopes.
3. **Credentials → Create credentials → OAuth client ID → Web application**:
   - Authorised JavaScript origins: `https://shunwg.github.io`
   - Authorised redirect URI: `https://<something>.supabase.co/auth/v1/callback`
     *(Supabase's callback, not ours — the browser only ever returns to us afterwards.)*
4. Copy the **Client ID** and **Client secret** into Supabase →
   **Authentication → Providers → Google** → enable, paste both, save.

## 3. Apple — needs the paid programme, ~30 min

Only worth doing when you actually want it; Google alone works on iPhones too, in Safari.

1. **Apple Developer Program membership** — ~$99/yr, [developer.apple.com/programs](https://developer.apple.com/programs/).
   There is no free tier for Sign in with Apple on the web.
2. **Certificates, IDs & Profiles → Identifiers**:
   - An **App ID** with *Sign In with Apple* enabled.
   - A **Services ID** (e.g. `no.ordforeren.web`) — this is what the web flow uses.
     Configure it: domain `shunwg.github.io`, return URL
     `https://<something>.supabase.co/auth/v1/callback`.
3. **Keys → new key** with *Sign In with Apple* enabled. Download the `.p8` **once** — Apple never
   shows it again.
4. Supabase → **Authentication → Providers → Apple** → enable, and supply Services ID, Team ID,
   Key ID and the `.p8` contents.

**Apple gives you the player's name exactly once**, on the very first authorisation, and never again.
`authProfileFromUser()` already falls back through the email local-part for this reason, and there is
a test pinning it — that path is the normal case for Apple users, not an edge case.

If you skip Apple, drop `"apple"` from `AUTH_CONFIG.PROVIDERS` and the button disappears on its own.

---

## When you are done

```bash
node --test Lab/js/online.test.mjs && node Tools/build-standalone.mjs
```

Then open the Lab, pick **Spill med venner**, and you should be sent to Google and returned signed
in. A share link (`?room=ABC123`) should survive the round trip — `authAuthorizeUrl()` carries the
whole current URL, not just the origin, so an invited guest lands back in the room rather than on the
home screen holding no code. There is a test for that too, but it is worth seeing once.

## What stays true afterwards

- **Én telefon and the offline bundle need no account.** `authRequired()` covers the networked modes
  only. `dist/Ordforeren.html` still works from a double-click with no network, which is what
  `Play Ordforeren.cmd` opens and what the README promises.
- **The game itself never touches the backend.** Cards, lies and votes still go peer-to-peer; the
  broker and Supabase both stay ignorant of them. Supabase holds an identity and a rating, nothing
  about a round.
- **The About copy now says so.** It names Supabase in both languages. If the backend's role ever
  grows, that copy grows with it — per CLAUDE.md, it may never re-assert "we store nothing".
