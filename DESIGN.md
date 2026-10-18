# LexGo mobile — design system

Expo / React Native app (iOS + Android), light and dark themes. Brand is shared with the web portal (`law-main`):
blue → cyan, Onest for display, Inter for UI text. Surfaces are app UI (Operate mode): precision and restraint,
familiar platform patterns, brand shows in details.

## Tokens (`@/shared/theme`)

- **Colors** — always via `useColors()` / `useTheme()`, never raw hex for neutrals, so both themes work:
  `bg` (page canvas, cool off-white in light), `surface` (cards, sheets), `surface2` (wells, tracks, idle fills),
  `line` (borders, dividers), `ink` / `gray` / `gray2` (text tiers), `tint` / `tint2` (soft brand fills),
  `accent` / `accentStrong` (interactive + selected), status pairs `ok/okBg`, `err/errBg`, `warn/warnBg`, `cyBg/cyText`.
- **Brand** — `brand.*`, `gradient.primary` / `gradient.dark` for hero bands and primary CTAs only.
  White text / `rgba(255,255,255,x)` is correct *on* those gradients.
- **Radius** — `radius.sm` 10 (small chips, icon tiles), `radius.r` 14 (fields, inner tiles), `radius.rl` 20 (cards),
  `radius.rx` 28 (sheets, hero bands), `radius.pill`.
- **Spacing** — 4pt grid (`space.*`). Tight inside a group (6–10), generous between groups (20–28).
  Screen gutter 16.
- **Shadows** — `shadows.s1` (resting cards), `shadows.s2` (floating: sheets, toasts, raised cards),
  `shadows.blue` (primary CTA, active chip). No ad-hoc shadow values.
- **Type** — `<Text variant>`: `hx`, `h2`, `h3` (Onest), `h4`, `body`, `lead`, `small`, `caption`, `kicker`.
  Prefer variants + `tone` over hand-set fontSize/fontFamily.

## Components (`@/shared/ui`)

Use the shared primitive whenever a screen hand-rolls the same thing: `Button`, `Card`, `ListRow`, `Pill`, `Chip`,
`Input`, `Segmented`, `Toggle`, `EmptyState`, `Skeleton*`, `SectionHeader`, `IconButton`, `Header`, `Screen`.
Anything tappable gets `PressableScale` feedback (spring + slight dim + light haptic).

## Motion

Reanimated 4. Motion conveys state: press, reveal, list arrival, sheet, toast. 150–260 ms, ease-out or a damped
spring. Primary lists may enter with `FadeInDown` and a short stagger (≤ 40 ms per item, capped at ~6 items).
No orchestrated page-load choreography, no looping decoration. Reduce Motion is honored by Reanimated defaults.

## Rules

- Touch targets ≥ 44pt; adjacent targets have breathing room.
- Contrast: body text ≥ 4.5:1, large text ≥ 3:1. Secondary text on colored fills takes that fill's hue, not gray.
- No new eyebrow/kicker labels, no gradient text, no glass/blur as decoration, no colored side borders > 1px,
  no nested cards, no emoji as icons.
- Every list has loading (skeleton), empty (`EmptyState`) and error (`ErrorView`) states.
