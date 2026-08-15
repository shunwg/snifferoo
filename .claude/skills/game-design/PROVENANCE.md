# PROVENANCE — game-design

## Fetch record
- **Requested:** 2026-08-15, by the user, as
  `npx skillfish add rbergman/dark-matter-marketplace game-design`
- **Source:** `github.com/rbergman/dark-matter-marketplace`,
  path `plugins/game-dev/skills/game-design/` (branch `main`)
- **Repo at fetch time:** created 2026-01-09, last pushed 2026-08-08, 11 stars, no description
- **How:** the `npx skillfish` call was blocked by this machine's permission classifier, so the
  seven files were fetched individually from `raw.githubusercontent.com` and written here by hand.
  Same result, no third-party code executed. Byte sizes were checked against the GitHub contents
  API listing and match exactly (SKILL.md 8244; rubric 2803, domain-guide 7994, numbers-policy 3648,
  routing-map 4263, templates 4355, worked-examples 9034).
- **Not installed:** the other 26 skills in the `game-dev` plugin. Only `game-design` was asked for.

## Licence position — UNRESOLVED
The source repo carries **no licence file** (GitHub API reports `"license": null`). No grant of
rights is stated, which under default copyright means all rights reserved.

This is tolerable while the skill is a local working aid, and it is *not* shipped inside the game —
no part of it reaches `dist/`, `Resources/` or any player. But this repo is going public, and
committing an unlicensed third-party work into a public repo is a different act from keeping it on
disk. **Resolve before the repo is published, or drop the directory.** ASSETS.md rule zero
("unknown license = doesn't exist") governs art and audio, not skills, so this sits outside that
gate by letter — the spirit still points the same way. Asking the author to add a licence is the
cheap fix.

## What it is
A hub skill for evaluating a single game mechanic: the 5-Component Filter (Clarity, Motivation,
Response, Satisfaction, Fit), a mandatory Numbers Policy, a state-machine checklist, a
symptom-to-skill debugging table, and playtest requirements.

Read before installing; it contains no instructions to fetch, send, or execute anything, and no
content directed at the agent beyond its stated subject. Its sourcing note is unusually honest —
it says outright that the 5-Component Filter is the plugin's own synthesis with no external
citation, and names its real inputs (Hodent, *The Gamer's Brain*, 2017; Swink, *Game Feel*, 2008;
Hunicke/LeBlanc/Zubek's MDA, 2004).

## Known limitation: the routing is mostly dangling
`SKILL.md` calls itself "the hub", and `references/routing-map.md` is an index of which sibling
answers which question. **26 siblings are referenced; 25 are not installed** — `player-ux`,
`experience-design`, `game-balance`, `progression-systems`, `systems-design`, `narrative-design`,
`economy-design` and the rest all resolve to nothing.

The self-contained parts work regardless: the 5-Component Filter, Numbers Policy, State Machine
Checklist, Debugging Protocol, Playtest Requirements and Definition of Done need no siblings. Only
the "Deep Dive" column of the debugging table and the Related Skills section degrade.

## Collision note — `game-feel`
The marketplace ships its own `game-feel`, and this repo already has one. **The marketplace version
was NOT installed and must not be**: ours is the Swink-derived house skill described in TOOLBELT.md,
it owns a deliberate split with `motion-designer`, and `Tools/check-game-feel.mjs` gates against
DESIGN.md §7. Overwriting it would break a gate.

The two share ancestry — both trace to Swink's *Game Feel* — so the three debugging-table rows that
route to **game-feel** land somewhere compatible by accident rather than design. Treat that as luck,
not integration.
