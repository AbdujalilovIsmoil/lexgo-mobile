# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

One product with two design languages: iOS = Liquid Glass over a vivid aurora; Android = Material 3 Expressive (tonal surfaces, large rounded shapes, Material navigation bar and dialogs) in the LexGo brand colours (no Dynamic Color; choice delegated to the recommended default). Content and section order are identical on both.

## Users
Primary: advocates (advokat) and yurists who use the app as a daily working tool — incoming orders and requests, court dates and deadlines, clients, cases, documents, tasks, payouts. They open it many times a day, often between meetings or in court corridors, and need it fast, exact and trustworthy.
Also served by the same design system: clients (mijoz) arriving with a legal problem, and staff/admin roles. When these conflict, the advocate/yurist working flow wins.

## Product Purpose
LexGo is an Uzbekistan legal-services ecosystem ("Yuridik yordam endi bir necha tegishda"): AI assistant, online services, an advocates marketplace and a personal-advocate subscription, with a call-center layer. The mobile app is the Expo client of one backend shared with the Next.js web portal. Success for a seller: orders, cases and deadlines handled without friction. Success for a client: a legal need turned into a booked, paid, tracked service.

## Operating Context
Roles: client, advokat, yurist, advokat tashkiloti, call-center, sales, admin/staff. Seller home ("Ish maydoni") is the landing tab for advocates/yurists. Tab sets differ per role. Uzbek (Latin) is the primary language, with ru and en locales. Dark and light themes both ship.

## Capabilities and Constraints
- Expo SDK 57, expo-router, React Native 0.86; iOS 26 Liquid Glass available via expo-glass-effect and the system NativeTabs bar; before iOS 26, on Android and with Reduce Transparency a solid fallback must remain.
- The order and grouping of sections on every screen (and the tab order per role) must not change in the redesign — only how things look.
- Android follows Material 3 Expressive; nothing may disappear: every block, label and the order of sections and tabs stay as on iOS.

## Brand Commitments
The LexGo logo and name stay. Every other visual decision (palette, type, surfaces, motion) is open for redesign.

## Evidence on Hand
Existing screens in `src/pages`, `src/widgets`; shared primitives in `src/shared/ui`; product analysis in `MAQSAD.md` and `TZ.md`. No customer quotes or metrics are recorded; none should be invented.

## Product Principles
1. The advocate's working flow comes first: the next deadline, order or client is always one glance away.
2. Trust before flash: a legal product must feel exact and calm even when it is vivid.
3. Structure is a promise: section order and navigation stay predictable across redesigns.
4. One design system for every role, tuned (not forked) for the advocate/yurist.
