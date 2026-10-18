# LexGo — mobile (React Native / Expo)

Mobile client for the LexGo legal-services platform. Same backend and the same
design tokens (colors, radii, shadows, Onest + Inter fonts) as the Next.js site
in `../law-main`.

## Run

```bash
cd mobile
npm install
cp .env.example .env        # EXPO_PUBLIC_API_BASE_URL (defaults to the production backend)
npx expo start              # Expo Go / dev client
npm run typecheck           # tsc --noEmit
```

## Architecture — Feature-Sliced Design

Every file stays under ~70 lines; a slice is split as soon as it grows.

```
app/                    expo-router routes (thin: re-export a page)
src/
  core/providers/        AppProviders: gestures → safe area → theme → react-query → fonts/session gate
  pages/                one screen per folder (HomePage, LawyersPage, AiChatPage, …)
  widgets/              composed blocks: tab-bar, home-hero, lawyer-detail, profile, chat, services
  features/             user actions: auth (login / register / OTP / forgot / logout),
                        ai-chat (send, quick prompts, limits), lawyer-filter, choose-plan,
                        theme-switch, locale-switch
  entities/             domain models + API + base UI: session, lawyer, service, plan,
                        chat, order, notification
  shared/
    api/                fetch wrapper with bearer auth + single-flight refresh, ApiError
    theme/              palette ported from law-main/app/globals.css (light + dark), typography
    i18n/               uz / ru / en dictionaries (uz is the source of truth) + useT()
    ui/                 Text, Button, Card, Pill, Input, Avatar, Skeleton, EmptyState, Toaster…
    lib/                storage (SecureStore / AsyncStorage), phone mask, money, haptics
```

Import rule: a layer may import only from layers below it
(`pages → widgets → features → entities → shared`). Slices on the same layer
never import each other.

## Screens

| Route | Screen |
| --- | --- |
| `/(tabs)` | Home · Services · AI · Lawyers · Profile |
| `/lawyer/[id]` | Lawyer profile with stats and actions |
| `/services/[categoryId]` | Services of a category |
| `/subscription` | Client tariffs (1 / 6 / 12 months) |
| `/auth/login` `/auth/register` `/auth/otp` `/auth/forgot` | Phone + password auth, Telegram OTP, 2FA |
| `/chats` `/orders` `/notifications` | AI history, my orders, notifications |

## Backend endpoints used

`/auth/*`, `/marketplace/lawyers` (fallback `/lawyers`), `/service-categories`,
`/services`, `/services/search`, `/subscription-plans`,
`/subscription-plans/{id}/telegram-purchase-request`, `/clients/{id}/chats…`,
`/orders`, `/notifications`.

Checkout and marketplace ordering still happen on the website; the app says so
where a flow ends there.
