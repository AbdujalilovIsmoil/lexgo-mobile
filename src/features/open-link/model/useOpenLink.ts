import { useCallback } from "react";
import { useRouter, type Href } from "expo-router";
import { useT } from "@/shared/i18n";
import { type Resolution } from "@/shared/links";
import { toast } from "@/shared/ui";
import { openLink, resolveRequest, type OpenResult } from "./openLink";
import type { LinkRequest } from "./pending";
import { useViewer } from "./viewer";

// `open(request, source)` for taps; `resolve(request)` to preview where a request leads (the
// button label of a notification detail) without opening anything.
export function useOpenLink() {
  const router = useRouter();
  const { t } = useT();
  const viewer = useViewer();
  const open = useCallback(
    (req: LinkRequest, source: string): Promise<OpenResult> => openLink(req, viewer, { navigate: (h) => router.navigate(h as Href), say: toast, t }, source),
    [router, viewer, t],
  );
  const resolve = useCallback((req: LinkRequest): Resolution => resolveRequest(req, viewer), [viewer]);
  return { open, resolve, viewer };
}
