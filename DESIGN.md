# DESIGN.md v3 — Ordføreren design system

**Subject:** a living-room quiz-show where one player runs the stage and everyone else lies for points, progress told by pawns on a board.
**Job:** legible across a table, delicious to lie in, and a board that makes every point *felt*.
**Boldness budget, spent in two places:** the **Nose** (per-round drama) and the **Board** (per-game drama). Everything else stays quiet.
**Living reference:** `Reference/cocky-monk-demo.html` implements this system — when a spacing, timing, or color question is ambiguous below, open the demo; its behavior is canonical.

## 1. Principles
1. **The table is the screen.** Arm's-length legibility; the GM phone doubles as a little stage.
2. **Colour means something, and never says it alone.** Truth = `confirmed`, bluff = `alert`, your move = `action`, **GM = `private`**. A shape or an icon always backs the colour up (§9).
3. **Pieces, not pixels.** Every surface behaves like a physical game component — hard shadows, mechanical presses, paper texture.
4. **Two stages per round:** the Reveal (who lied to whom) then the Board (what it cost). Never merge them.
5. **Themes change clothes, never rules.** All three boards share one geometry, one physics of hopping, one sound grammar.

## 2. Tokens

### Color — MONOCHROME, LIGHT (redesigned 2026-07-28)

**Inverted 2026-07-28b.** The page is white and the cards are the dark plane —
black and white interchanged, so the app reads predominantly white. This was NOT
a mechanical luminance flip: that inverts values but not ROLES. "Hairline" and
"recessed" are defined *relative to the page*, so a straight flip turned the
hairline near-white (invisible on white) and pushed the secret card the wrong
way. The roles are re-derived below; the value ORDER inside each family is
preserved, so the hierarchy the dark version earned survives the flip.

The player ramp flipped with it and is now bounded from the other side: the
initial inside each token is white, and white-on-token needs 4.5:1, which caps
how *light* a token may be.


One greyscale ramp. No hue anywhere: not in the chrome, not in the player
identities, not in the three board themes. Requested directly ("så svart, hvitt
og grått som mulig, men på en moderne og minimalistisk måte"), and it sharpens
§9 rather than fighting it — *never colour alone* becomes *never colour at all*,
so every distinction has to be carried by value, fill, weight or shape.

| Token | Hex | Use |
|---|---|---|
| `backdrop` | `#0B0B0C` | App background |
| `raised` | `#17171C` | Inputs and recessed fields on the backdrop |
| `line` | `#2A2A2F` | Hairlines — the only border weight left |
| `sheet` | `#F4F4F2` | Cards, options — the reading surface |
| `sheetSunk` | `#E4E4E1` | An option that has receded (a revealed bluff) |
| `ink` | `#0B0B0C` | Text on `sheet` |
| `inkInverse` | `#F4F4F2` | Text on `backdrop` |
| `confirmed` | `#FFFFFF` | The truth. The brightest value in the app |
| `alert` | `#8F8F94` | Bluff. A MID grey — it carries dark text, never light |
| `action` | `#F4F4F2` | Primary CTA: the brightest plate, black label |
| `private` | `#3D3D42` | Game-master, and the inverted secret card |
| `quiet` | `#6F6F74` | Dividers, pending, board path |

**Value IS the hierarchy, so the values must differ.** Three steps, dim to bright:
an option you may pick (`sheetSunk`), the button that commits (`sheet`), the revealed
truth (`confirmed`, pure white + ink ring). The CTA and a vote option were briefly the
*same* value — survivable in colour, fatal in greyscale, where it read as five equal
buttons and broke §6's one-primary-action rule.

**What replaced the colours that carried meaning.** Green-truth and pink-bluff
were doing real work in the reveal, so three separate mechanisms took over:
truth is a pure-white plate with a heavy ink ring, a revealed bluff *sinks* to
`sheetSunk` and dims, and a GM decoy keeps the dashed "classified" edge. Three
different channels, so they survive greyscale, Dynamic Type XL and colour
blindness alike.

**Player identity.** Eight greys are not eight hues — at 18 px they are a
guessing game. So the player's **initial is drawn inside the token** and the
value only reinforces it. The ramp is bounded below by the black initial needing
4.5:1 *inside* the token, and ordered to maximise the weakest adjacent pair
(2.09:1, found exhaustively across all 8! orderings; a naive light/dark zigzag
scored 1.24).

**The board themes are desaturated by luminance**, not by an HSL saturation
wipe — that preserves every value relationship (dark wood stays dark, snow stays
bright) while removing hue, so Salongen/Fjellet/Verdensrommet stay distinguishable
by texture and form rather than by colour.

### Type
| Role | Face | Notes |
|---|---|---|
| Display (card words, headings, scores, letter chips) | **Fredoka** SemiBold/Bold — OFL, bundled, license row in ASSETS.md; SF Rounded fallback | Card words are the hero: scale toward 52 pt, slightly tight tracking |
| Body / UI | SF Pro | Dynamic Type throughout |
| Eyebrows (section labels like "ORDET ER") | Fredoka 12 pt, uppercase, +0.14 em tracking, `quietText` | Quiet structure without headers |

### Surface language — minimal, not "pieces on a table"

*Rewritten 2026-07-28.* The previous language stacked three separate ways of
saying "physical object": a 2.5 pt ink outline, a hard offset shadow, and paper
grain — on every card, option and button. In greyscale those stop reading as
texture and start reading as noise, and DESIGN-DIRECTION.md §6 is explicit:
one dominant idea per screen, remove decoration before adding it.

- **No outlines by default.** A near-white plane on a near-black ground is
  already the strongest edge available; drawing one on top is redundant.
- **Hairlines, 1 px, `line`** — for the things that genuinely need an edge
  without a fill: secondary buttons, chips, inputs, segment controls.
- **No hard offset shadows. No paper grain. No letterpress.**
- **The press survives.** `translateY(2px)` plus a slight dim: it is a named
  beat (§7) and the only tactile feedback a flat control has. What went is the
  coloured 5 px under-shadow, which was drawing a plastic toy.
- **Hierarchy is value.** The primary action is simply the brightest thing on
  the screen — there is no "yellow means go" left to lean on.
- **The one inversion is the secret card**: dark plane, light text, dashed edge.
  Inversion is the loudest statement a greyscale system can make, so it is spent
  on the one surface a player is forbidden to see, and nowhere else.
- Shapes: 22 pt card radius, 16 pt buttons, capsule chips. Nothing sharp.
- **Iconography:** functional emoji only. Everything decorative is *drawn*.

## 3. The three boards
One `BoardLayout` (a winding serpentine of *target* spaces, Start → Mål) rendered by three `BoardTheme`s. Raw sprite material: Kenney CC0 packs in `AssetsIncoming/` (see ASSETS.md) — recolor and curate; never ship raw defaults.

| | **Salongen** (default) | **Fjellet** | **Verdensrommet** |
|---|---|---|---|
| Fantasy | Classic wooden parlor game, Sunday at bestemor's | Norwegian mountain hike to the summit | Rocket race to the moon |
| Background | Warm wood grain, soft lamp vignette | Layered paper-cut mountains; weather shifts as you climb | Deep space `#0D0D1F`, drifting stars (slow parallax; Reduced Motion: static) |
| Track spaces | Inlaid wooden discs | Stone cairns / trail dots | Glowing orbit rings on dark discs |
| Pawns | Classic pieces (`boardgame-pack/PNG/Pieces (*)`) recolored to avatar palette | Tiny backpacker meeples (piece + knapsack accent) | Mini rockets, exhaust puff per hop |
| ⅓ / ⅔ landmarks | Coffee table / grandfather clock chime | Tregrensa (treeline) / Snøgrensa (pawns get a knit cap) | Satellite flyby / asteroid belt |
| Mål moment | Trophy on doily + confetti | Summit flag planted + wind gust | Moon landing + flag + slow-mo dust |
| Hop sound | Wooden tap | Boot crunch | Soft thruster pop |
| Palette accents | Warm browns + `action` | Greens/greys + snow white | Indigo + `private` glow |
| Extra | — | — | Goal space pulses a slow gold ring (2 s) until claimed — all themes inherit this |

Rules: identical space geometry and pawn physics; only layers, sprites, particles, and sounds differ. A theme is one config struct + assets — a 4th theme must be a one-file job.

## 4. Signature 1: **Oppslutningen** — the mark and the mechanic
*(Rewritten 2026-08-16. This section described a bevelled cream monk's face with a
pink capsule nose, pinned to the unit. It had already been overtaken twice — by
the monochrome inversion and by the rat — and carried a "pending redraw" note
promising a snout that never arrived. A spec that documents a drawing nobody
ships is worse than no spec: it is a spec people trust.)*

**The logo**: a **rosette** — twelve semicircular bulges generated on a base
circle, two ribbon tails, a knocked-out centre. The campaign badge you pin on when
the room backs you. This IS the app icon, the top-bar brand, the loader and every
empty state.

**In play:** the rosette wears a **sash that lengthens one notch per vote your
version collected** (rising pitch per notch). The ordstyrer's decoys wear a
`private`-toned sash — the room learns to read it. Whoever ends with the most
oppslutning takes that badge on the winner screen, separate from winning on
points, so there are two things to brag about. Reduced Motion: crossfade to final
length.

**Mark geometry.** One drawing serves the logo, the app icon and every avatar, so
it is pinned here rather than left to each implementation:

| | |
|---|---|
| Disc | Twelve semicircular bulges on a base circle of r=28 at (50,40) in a 100-unit box. **Generated, not hand-drawn** — uneven pleats read as a wobble large and as dirt small. |
| Centre | A knocked-out hole, r=10.5. A hole, never a second shape filled with the background colour: the mark must be correct on the light page and the dark card from one drawing. |
| Tails | Two ribbons from the disc's underside to y≈97, with a swallowtail notch. **These are the identity** — a circle alone is nothing. Wide, not thin: thin goes spindly and short vanishes under the disc at 22 px. |
| Sash | Behind the rosette, extending right, `0.16 + 0.30 × notch` of the box width. |

**Data vs decoration.** The same drawing has two jobs and they must stay visibly
separate. A sash marked *decorative* (logo, app icon, empty states) has no notch
at all. A sash that **reports a vote count** is exact — a decorative one on a
reporting badge would be a lie about the score. Every dimension is a ratio of one
size property so proportions hold from 22 px to 512 px.

**Contrast, learned the hard way.** The badge lives almost entirely on the dark
card plane. `--color-accent-truth` is `#000000`: 21:1 on the light page and
**1.15:1** on a card, where it disappears entirely. The eight player greys measure
about 2:1 there as a masked silhouette. So the badge is **ink**, and identity is
carried by the `dot()` beside it, which is a coloured disc with the player's
initial in it (§9, never colour alone). Measure any new mark against the plane it
actually sits on, not the one the token was designed for.

The app icon is `Lab/icon.svg`, rastered by `node Tools/make-icons.mjs`. **It has
been stale twice** — it was still the monk face two redesigns after the monk was
gone, because no gate renders an icon. If the mark changes, that file changes in
the same commit.

## 5. Signature 2: the Board ceremony
- Pawns hop **one space at a time** (interpolatingSpring ~0.35 s/hop, `.soft` haptic + theme hop-sound per space). Multiple earners animate in submission order, never simultaneously — the room watches each fortune change.
- Camera gently follows the active pawn; the leader wears a subtle crown.
- Overtake: the passed pawn does a tiny indignant wobble.
- GM steal (+2 nobody-found-it): GM pawn hops with the violet sting and a dark little chuckle (tasteful, ≤ 0.8 s).
- Board phase hard cap 20 s (PRD §11) — hop timing compresses automatically on big rounds.

## 6. GM Dashboard — the quiz-show desk
Top→bottom: eyebrow + card word (display type) · the truth on the dashed `private` "classified" card, **hold-to-peek** (blurred until pressed, so shoulder-surfers see nothing) · decoy composer (0–2 one-liners) · **tick-in row**: one chip per bluffer, "tenker…" pulsing until it flips with a snap + `.light` haptic to "klar ✓" as each submission lands (in practice/party these arrive live on real delays) · the **Åpne avstemning** button: full-width `action`, dim until all lies are in, then arms with a slow pulse. Pressing it fires the card-shuffle sound on every device. During voting the dashboard becomes a live anonymous tally.

## 7. Motion & sound grammar
| Moment | Treatment |
|---|---|
| New GM announced | Violet sash sweep, short fanfare, GM face bobbing with its smirk + violet nose |
| Tick-in | Chip flip + `chips-collide` (Kenney casino-audio) + `.light` |
| Vote opens | `card-shuffle.ogg` everywhere; options **stagger in** ~70 ms apart, rising 10 pt |
| Vote cast | `card-slide` + `.light` |
| Tally | Anonymous dots land per option with soft pops; "n/total inne" counts up |
| Reveal card entrance | Newest card **pops** (scale .85→1 with −1.5° un-rotate, spring); nose grows with boing ×votes |
| Truth reveal | Dim → truth card scales 1.06→1.0, `confirmed` glow + shadow, confetti, `.success` |
| GM steal | Screen tint pulses `private`, sting, `.heavy` |
| Reveal pacing | Human GM taps each beat; a bot GM (practice mode) auto-paces at ~1.7 s/beat with a tap-to-skip button |
| Waiting room | Your face **bobs** gently (±7 pt, 2.4 s loop) wearing its smile; bot/player chips pulse "tenker…". No music by default |
| Goal space | Slow gold pulse ring (2 s) until claimed |
| **Countdown** *(amended 2026-07-28 — was a conic ring)* | A depleting **bar**, `scaleX` on the compositor, gliding over 1 s between the once-a-second writes so it never steps. Thickens 8 → 10 → 13 px as it passes warn and urgent, so the state survives greyscale and colour-blindness — never colour alone (§9) |
| **Closing window (15 s)** | The screen begins to breathe: an inset vignette whose **rate climbs** from 0.8 Hz to 2.5 Hz as zero approaches, so the acceleration itself is the message. One soft `closing` tone + a short `closing` tap on entry; the pulse after that is a **state**, not a beat, and never re-triggers sound or haptics. **Capped at 2.5 Hz: WCAG 2.3.1 puts the seizure threshold at three flashes a second — a safety limit, not taste.** Reduced Motion rests at the trough, a steady dim edge, with sound and haptic carrying more |
| **Urgent (5 s)** | The second and louder beat: `urgent` tone + `.warning` haptic, edge-triggered once. Only fires at a player who still **owes an answer** — on BLUFF, VOTE or GM_DASH. A spectator, a timed-out player, or anyone on a waiting screen gets neither pulse nor buzz, because an effect that says "act now" to someone who already acted is a lie about their own state |
All audio ducks under, never over, the room. One-shots ≤ 1.5 s. Sources CC0 or OFL only, logged in `Resources/Audio/CREDITS.md` / ASSETS.md.

## 8. Voice
Playful conspirator, sentence case, never childish, never mean. The app is in on the joke; the *players* are the funny ones. Both languages written natively — translate *the joke*, never the words.

| Moment | nb | en |
|---|---|---|
| GM round start | "{navn} er spillmester. Frykt nesen." | "{name} is game master. Fear the nose." |
| Bluff entry | "Din tur til å dikte." | "Your turn to invent." |
| Empty bluff | "Selv en dårlig løgn er bedre enn ingen." | "Even a bad lie beats no lie." |
| Tick-in done | "Alle løgnene er inne." | "All lies accounted for." |
| Open vote | "Åpne avstemning" | "Open the vote" |
| GM steal | "Ingen fant sannheten. Spillmesteren håver inn!" | "Nobody found the truth. The game master cashes in!" |
| Overtake | "{navn} snek seg forbi!" | "{name} sneaks ahead!" |
| Winner | "{navn} vant! Resten av dere: godt forsøk." | "{name} wins! The rest of you: nice try." |

Rules: max one exclamation mark per screen. Buttons say what they do ("Neste runde", never "OK"). Errors explain and point forward, never apologize.

## 9. Accessibility floor (non-negotiable)
Dynamic Type through XL without truncation · VoiceOver labels everything, including board state ("Anne hopper to felt, leder på felt 9") and live tick-ins ("Kåre er klar") · contrast ≥ 4.5:1 on every theme background (snapshot-test all three) · Reduced Motion: hops → slides, pops/bobs → crossfades · nothing conveyed by color alone · GM dashboard fully operable with Switch Control · waiting states never strand VoiceOver users silently.
