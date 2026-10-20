import { isBlank, type StudioConstructor } from "@/entities/admin-studio";
import { checkFields } from "../form/nested";
import type { Dict } from "@/shared/lib/json";
import type { EditorEntry, Errors } from "../form/types";
import { GENERIC } from "./GenericEditor";
import { K02 } from "./k02/K02Editor";
import { K03M } from "./K03MEditor";
import { K05 } from "./K05Editor";
import { K06 } from "./K06Editor";
import { K12_PROMO } from "./K12PromoEditor";
import { K14 } from "./K14Editor";
import { K16 } from "./K16Editor";
import { K20 } from "./K20Editor";
import { K29 } from "./K29Editor";

const CUSTOM: Record<string, EditorEntry> = { K02, "K03-M": K03M, K29, K05, K06, "K12-PROMO": K12_PROMO, K14, K16, K20 };

export const editorFor = (code: string): EditorEntry => CUSTOM[code] ?? GENERIC;

// Client-side check before submit: required schema fields plus the editor's own rules.
// The object title counts as the payload `title` (as on the web).
export function validatePayload(code: string, payload: Dict, ctor: StudioConstructor | null, objectTitle: string): Errors {
  const editor = editorFor(code);
  const own = editor.validate(payload);
  const required: Errors = Object.fromEntries((ctor?.required ?? []).filter((f) => isBlank(payload[f])).map((f) => [f, "@required"]));
  const out = { ...checkFields((ctor?.fields ?? []).filter((f) => !editor.handled.includes(f.key)), payload, "", {}), ...required, ...own };
  if (isBlank(payload.title) && objectTitle.trim() && out.title === "@required") delete out.title;
  return out;
}
