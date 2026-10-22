# LexGo mobile — design system

Expo / React Native app (iOS + Android), light and dark themes. Brand is shared with the web portal (`law-main`):
blue → cyan, Onest for display, Inter for UI text. Surfaces are app UI (Operate mode): precision and restraint,
familiar platform patterns, brand shows in details.

## Tokens (`@/shared/theme`)

- **Colors** — always via `useColors()` / `useTheme()`, never raw hex for neutrals, so both themes work:
  `bg` (opaque base: footers, composers; a pale blue in light, deep navy in dark on iOS), `canvas` (page background — transparent on
  iOS so the aurora shows, the solid bg elsewhere), `glassFill` / `glassLine` (a card's translucent fill and bright hairline on iOS,
  the solid surface and line elsewhere), `surface` (opaque panels, thumbs), `surface2` (wells, tracks, idle fills — translucent on iOS),
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

## Materials (iOS 26 Liquid Glass + aurora)

**Currently OFF** (`src/shared/theme/flags.ts`: `AURORA = false`, `FLOATING_GLASS = false`): the vivid aurora, transparent pages and frosted cards read too bright / childish, so iOS shows the plain solid canvas and cards again. What stays glass: the system tab bar and the drawer (`useGlass(true)` / `<GlassBackdrop always>`). Flip the flags to bring the rest back; the notes below describe the flags-on state. Android keeps the solid tokens above.

iOS (flags on) is a glass-on-colour system.

- **Aurora canvas.** Every page sits on a static, vivid colour field: three soft fields (cyan, brand blue, violet) plus one role
  glow in the bottom-right corner — gold for advocates, magenta for yurists. `AuroraBackdrop` (Skia) sits behind stack screens;
  tab pages get the same fields as `contentStyle.experimental_backgroundImage` (`useAuroraStyle`), because the system tab host sits
  above the RN root. Pages are transparent (`c.canvas`); never give a page an opaque background on iOS.
- **Glass layer** (`GlassBackdrop` / `useGlass`): only the floating layer is real system glass — the tab bar (NativeTabs), header icon
  buttons and glass pills (always `scheme="dark"`, they sit on the dark hero), toasts, bottom sheets, confirm dialogs, the drawer.
  It falls back to the solid style before iOS 26, without the native part, and with Reduce Transparency.
- **Cards** are frosted panes, not real glass (a native glass view per list row is too heavy): `glassFill` + `glassLine`, a short bright
  top sheen, no shadow (a shadow would show through the translucent fill). Card-shaped surfaces that are not `<Card>` (rows, panels,
  inputs) use the same two tokens; `surface` stays for opaque things (thumbs, sheets' content). Do not nest cards.
- The tab bar is the system `NativeTabs` bar; the app's theme is handed to iOS (`Appearance.setColorScheme`) so it matches. The AI tab is a raised button: its slot in the system bar is an empty image, and `AiRaisedButton` stands in it, rising above the bar. The disc is drawn live on a Skia canvas (`AiMark`): a constellation of neuron nodes joined into a four-point spark — the links are drawn node to node, the spokes reach the core, the nodes light up, the spark fills with a soft glow and a pulse of "thought" runs round the network, in a 10 s loop (static with Reduce Motion), plus a soft ring that breathes out of it. The AI tab is always the middle slot (an empty disabled `gap` slot beside it when the tab count is even), so the button is centred on the screen; its height constants are at the top of the file. three.js was considered and left out: it would need `expo-gl` (a native module and a new build) and a GL context per tab button. Glows, aurora and glass spheres were tried and dropped as too flashy for the calm, exact tone.

## Materials (Android — Material 3 Expressive)

Android is the second design language: tonal, not glass. Same content and section order as iOS; brand colours, no Dynamic Color.

- **Tonal surfaces.** `bg` is a pale blue-tinted surface (deep navy in dark); a card is a *filled tonal container* (`surface` = `glassFill`
  = a primary-tinted tone), 24dp corners, no outline, no drop shadow (`shadows.s1` / `blue` are elevation 0). `line` is only for dividers
  and input outlines. Wells inside a card (`surface2`) are a deeper tone of the same hue.
- **Navigation bar** (`FlatBar`): a tonal container (`tint`), 64×32 pill indicator (`tint2`) behind the active icon, label always shown.
  The AI destination keeps the middle slot and carries the brand gradient in its pill. Set `collapsable={false}` on a view that changes
  its background and has a radius — Android otherwise drops the corner radius when the colour changes.
- **Chip** = Material filter chip: 8dp corners, outlined idle, secondary container plus a check when selected.
- **Snackbar** (`Toaster`): an inverse surface, 8dp corners, full width, text from the left. **Dialog** (`ConfirmDialog`): 28dp corners,
  left-aligned title and text, two text buttons at the end (confirm in the brand or error colour).
- Not yet restyled for Material: the segmented control, the dark hero bands and the gradient tiles (they are shared with iOS).

## Motion

Reanimated 4. Motion conveys state: press, reveal, list arrival, sheet, toast. 150–260 ms, ease-out or a damped
spring. Primary lists may enter with `FadeInDown` and a short stagger (≤ 40 ms per item, capped at ~6 items).
No orchestrated page-load choreography, no looping decoration. Reduce Motion is honored by Reanimated defaults.

## Rules

- Touch targets ≥ 44pt; adjacent targets have breathing room.
- Contrast: body text ≥ 4.5:1, large text ≥ 3:1. Secondary text on colored fills takes that fill's hue, not gray.
- No new eyebrow/kicker labels, no gradient text, no glass on cards in lists or on opaque backgrounds (glass belongs to the floating
  layer over colour), no colored side borders > 1px,
  no nested cards, no emoji as icons.
- Every list has loading (skeleton), empty (`EmptyState`) and error (`ErrorView`) states.
