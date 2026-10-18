import { Dimensions } from "react-native";
import { postRuntime, useInstructorSession } from "@/entities/instructor";
import { ApiError } from "@/shared/api";
import { currentPath, screenId, targetDecls, usePathStore, visibleTargets } from "@/shared/instructor";
import { isLauncherTarget } from "../lib/selfHelp";
import { ENGAGED_MS, useInstructorUi } from "./uiStore";

const TYPES = ["button", "input", "textarea", "select", "card", "section", "tab", "modal", "table", "list", "list_item", "link", "file_dropzone", "editor", "chat", "call_button", "rating", "payment_gate"];
let timer: ReturnType<typeof setTimeout> | undefined;
let last = "";

const hash = (s: string): string => {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return `${s.length}:${h >>> 0}`;
};

async function flush(locale: string, role: string): Promise<void> {
  const sid = useInstructorSession.getState().sessionId;
  const ui = useInstructorUi.getState();
  if (!sid || !(ui.open || Date.now() - ui.lastChat < ENGAGED_MS)) return;
  const seen = (await visibleTargets()).filter((v) => !isLauncherTarget(v.id));
  const route = currentPath();
  const win = Dimensions.get("window");
  const title = seen.find((v) => v.type === "screen")?.label ?? screenId(usePathStore.getState().pathname);
  const body = {
    session_id: sid,
    locale,
    runtime_state: { current_route: route, visible_ai_ids: seen.filter((v) => v.inView).map((v) => v.id), selected_items: {}, form_state: {}, viewport: { width: Math.round(win.width), height: Math.round(win.height) }, open_modal: "" },
    ui_manifest: { route, role, page_title: title, elements: seen.map((v) => ({ ai_id: v.id, type: TYPES.includes(v.type) ? v.type : "section", label: v.label, actions: ["highlight", "scroll_to"] })) },
    visible_targets: seen.map((v) => v.id),
    targets: targetDecls(seen),
  };
  const h = hash(JSON.stringify(body));
  if (h === last) return;
  try {
    await postRuntime(body);
    last = h;
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 410)) useInstructorSession.getState().clear();
  }
}

// Tell the backend which screen / targets the user sees (debounced, de-duplicated) — only while the
// assistant is in use, so an idle user costs no traffic. Form values are never part of it.
export function scheduleRuntimeSync(locale: string, role: string): void {
  clearTimeout(timer);
  timer = setTimeout(() => void flush(locale, role), 800);
}

export const resetRuntimeSync = (): void => {
  last = "";
  clearTimeout(timer);
};
