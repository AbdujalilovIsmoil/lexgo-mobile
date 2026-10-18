export type { ConsentDoc, DocInput, DocSlot, DocState, UserConsent } from "./model/types";
export { REQUIRED_SLUGS, PLACEHOLDER_MAX } from "./model/types";
export { buildSlots, bump, cmpVersion, readyCount } from "./model/slots";
export { useDocs, useUserConsents, usePublishDoc, useEditDoc, useToggleDoc, legalKeys } from "./model/queries";
export { DocSlotRow, useSlugName } from "./ui/DocSlotRow";
export { ConsentRow } from "./ui/ConsentRow";
