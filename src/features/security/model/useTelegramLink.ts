import { useCallback, useState } from "react";
import { Share } from "react-native";
import { startTelegramLink } from "@/entities/security";
import { ApiError } from "@/shared/api";
import { errorHaptic, successHaptic } from "@/shared/lib/haptics";
import { openUrl } from "@/shared/lib/links";
import { useT } from "@/shared/i18n";
import { toast } from "@/shared/ui";
import { useSecError } from "../lib/useSecError";
import { useSyncProfile } from "../lib/useSyncProfile";
import { useTelegramPoll } from "./useTelegramPoll";

export type ActiveLink = { url: string; expiresAt: number; opened: boolean; relink: boolean };

// Telegram account link: start() gets a one-time t.me link (10 min), open()/share() hand it to the user,
// and /auth/me is polled until the bot webhook has stored the chat. `manual` links (already linked, or a
// backend that does not expose the state) cannot be confirmed, so they end with "Done".
export function useTelegramLink(linked: boolean | undefined) {
  const { t } = useT();
  const msg = useSecError();
  const sync = useSyncProfile();
  const [link, setLink] = useState<ActiveLink | null>(null);
  const [busy, setBusy] = useState(false);
  const [canPoll, setCanPoll] = useState(true);

  const start = async () => {
    if (busy) return;
    setBusy(true);
    setCanPoll(true);
    try {
      const r = await startTelegramLink();
      if (r.url) setLink({ url: r.url, expiresAt: r.expiresAt, opened: false, relink: linked === true || r.linked });
      else if (r.linked) {
        await sync();
        toast(t("admSecB.tgLinkedOk"), "ok");
      } else throw new Error("no link");
    } catch (e) {
      errorHaptic();
      toast(e instanceof ApiError && e.status === 503 ? t("admSecB.tgUnavailable") : msg(e, "admSecB.tgErrStart"), "err");
    } finally {
      setBusy(false);
    }
  };

  const open = () => {
    if (!link) return;
    openUrl(link.url);
    setLink({ ...link, opened: true });
  };
  // The link's one-time token binds a Telegram chat to the account: never the clipboard, the share sheet.
  const share = async () => {
    if (!link) return;
    await Share.share({ message: link.url }).then(() => setLink({ ...link, opened: true })).catch(() => {});
  };

  const watching = !!link && link.opened && !link.relink && linked !== true && canPoll;
  const onUnknown = useCallback(() => setCanPoll(false), []);
  const onLinked = useCallback(() => {
    void sync();
    successHaptic();
    toast(t("admSecB.tgLinkedOk"), "ok");
    setLink(null);
  }, [sync, t]);
  useTelegramPoll(watching, link?.expiresAt ?? 0, onLinked, onUnknown);

  return { link, busy, waiting: watching, manual: !!link && (link.relink || !canPoll), start, open, share, close: () => setLink(null) };
}
