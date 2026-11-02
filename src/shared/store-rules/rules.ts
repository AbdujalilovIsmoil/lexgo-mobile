import { Platform } from "react-native";

// App Store guideline 3.1.1: digital goods bought inside an iOS app must go through Apple In-App Purchase. LexGo sells its digital goods
// (AI plans and subscriptions, plan gifts, saved cards for plan autopay, seller promotions) through Payme / Click, so on iOS the app does
// not offer them at all: no screens, menu rows, upsells or "upgrade" buttons, and no wording that points to buying elsewhere.
// Real-world services done by people (a lawyer's order, market purchase, document order, milestones, urgent help, call minutes) are allowed
// to keep their own payment (3.1.3(d), 3.1.3(e)) and are not touched. Android keeps everything.
export const digitalSalesOn = (os: string): boolean => os !== "ios";
export const DIGITAL_SALES = digitalSalesOn(Platform.OS);

// Screens that only sell or manage digital goods.
export const DIGITAL_ROUTES = ["/subscription", "/subscriptions", "/entitlements", "/profile/gifts", "/profile/methods", "/pro/promotions"];

export function isDigitalRoute(href: string): boolean {
  const path = href.split(/[?#]/)[0].replace(/\/+$/, "") || "/";
  return DIGITAL_ROUTES.some((r) => path === r || path.startsWith(`${r}/`));
}

// A list of menu rows without the digital-goods screens when this platform may not sell them.
export function storeRows<T>(rows: T[], routeOf: (row: T) => string, sales = DIGITAL_SALES): T[] {
  return sales ? rows : rows.filter((r) => !isDigitalRoute(routeOf(r)));
}
