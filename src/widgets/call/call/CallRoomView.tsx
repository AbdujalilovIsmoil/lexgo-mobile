import { useEffect } from "react";
import { shouldHangUp, useCallActions, useCallChat, useCallScreen, useCaptureMute, useGuardWarnings, useUnansweredHangUp } from "@/features/call/call";
import { useRecording, useRosterToasts, useTransfer, useWork } from "@/features/call";
import { useSession } from "@/entities/session";
import { useT } from "@/shared/i18n";
import { CallStatusView } from "./CallStatusView";
import { LiveCall } from "./LiveCall";

// Gate of the call route: joining → (could not join | meeting ended) → the live call.
export function CallRoomView({ roomId, callId }: { roomId: string; callId: string }) {
  const { t } = useT();
  const chat = useCallChat(useSession()?.user.id ?? "");
  const s = useCallScreen(roomId, callId, chat.onData);
  const act = useCallActions({ roomId, callId, call: s.call, room: s.lk.room, signal: s.signal, refetch: s.refetch, leave: s.leave });
  const rec = useRecording(roomId, callId, s.call, s.refetch);
  const work = useWork(roomId, s.call);
  const transfer = useTransfer(roomId, callId, s.call, work, s.refetch);
  useRosterToasts(s.call?.participants, s.myId);
  const { ended, leave, phase } = s;
  useUnansweredHangUp(phase, roomId, callId, s.lk.room, s.signal);
  const captured = useCaptureMute(s.lk.room);
  useGuardWarnings(captured);
  const closing = ended || shouldHangUp(phase);
  useEffect(() => {
    if (!closing) return;
    const id = setTimeout(leave, 2200);
    return () => clearTimeout(id);
  }, [closing, leave]);
  const err = s.creds.error;
  if (err) return <CallStatusView kind={err.status === 409 ? "ended" : "error"} message={err.status === 409 ? t("admMeet.errEnded") : err.status === 404 ? t("admMeetB.errGone") : err.status === 403 ? t("admMeet.errForbidden") : err.detail || t("admMeet.errGeneric")} onRetry={err.status === 409 || err.status === 404 ? undefined : s.creds.retry} onBack={leave} />;
  if (s.dropped) return <CallStatusView kind="error" message={t("admMeet.dropped")} onRetry={s.creds.retry} onBack={leave} />;
  if (phase === "declined" || phase === "missed") return <CallStatusView kind={phase} onBack={leave} />;
  if (ended) return <CallStatusView kind="ended" onBack={leave} />;
  if (!s.creds.call) return <CallStatusView kind="connecting" onBack={leave} />;
  return <LiveCall s={s} act={act} chat={chat} rec={rec} transfer={work ? transfer : null} captured={captured} />;
}
