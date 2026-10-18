export type { ConsentDoc, ConsentDetail } from "./model/types";
export { useSignupConsents, useConsentDetail } from "./model/queries";
export { acceptConsent } from "./api/consentApi";
export { rememberConsents, flushConsents } from "./lib/pendingAccept";
