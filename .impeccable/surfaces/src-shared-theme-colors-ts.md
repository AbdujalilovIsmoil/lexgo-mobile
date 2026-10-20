---
version: 1
slug: "src-shared-theme-colors-ts"
primary_target: "src/shared/theme/colors.ts"
related_targets: []
---

# Surface brief — LexGo iOS app shell (all screens)

Mode: Operate. Platform: ios (Android untouched). Audience: advocates and yurists first, clients and staff on the same system. Constraint from the user: section order on every screen and the tab order per role never change; only the look does.

## Direction contract

THESIS: Liquid Glass over a living colour field — the app's canvas is a vivid, soft aurora and every surface floats on it as glass, so the iOS 26 system bar, sheets and controls and the app's own cards read as one material. It refuses the flat white-card-on-grey category default.
OWN-WORLD: Canvas = a base tone plus three large soft colour fields (cyan, brand blue, violet; an advocate adds gold, a yurist adds magenta-violet). Cards = translucent fill with a bright top sheen and a hairline edge (no shadow: a shadow shows through translucent fill); wells inside them are lighter translucent tints. Brand logo and name unchanged; Onest + Inter unchanged. Light mode is pastel-bright, dark mode deep navy with saturated fields.
STORY: An advocate between meetings opens the app, sees their day at a glance on a calm vivid ground, trusts it, and acts on the next order or deadline without hunting.
FIRST VIEWPORT: Seller home: the dark hero band stays on top as today; below it the canvas shows the aurora behind the same ordered blocks (new-order alert, quick actions, tasks, referral, AI, new cases, metrics, payouts), each a glass card. Primary action stays where it is.
FORM: Operate app shell on the platform's standard controls: system NativeTabs bar, glass sheets/dialogs, standard lists. Signature move: the role-tinted aurora behind glass. Brief-pinned direction (user asked for glass + vivid), seed: none (direction pinned by the user's brief; the roll was skipped on purpose).
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
