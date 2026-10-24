import { useEffect, useRef } from "react";
import { useScreenshotListener } from "expo-screen-capture";
import { useT } from "@/shared/i18n";
import { confirmDialog } from "@/shared/ui";

// A call is confidential. When the screen starts being recorded or shown on another device (screen recording, mirroring, AirPlay), or a
// screenshot is taken, the person is told why the picture is black and the other side's voice is muted (the screen guard and
// useCaptureMute do the blocking; this only explains it).
export function useGuardWarnings(captured: boolean): void {
  const { t } = useT();
  const tr = useRef(t);
  useEffect(() => { tr.current = t; });
  const warn = (kind: "rec" | "shot") =>
    confirmDialog({
      title: tr.current(kind === "rec" ? "admMeet.guardRecTitle" : "admMeet.guardShotTitle"),
      message: tr.current(kind === "rec" ? "admMeet.guardRecText" : "admMeet.guardShotText"),
      confirmLabel: tr.current("admMeet.guardOk"),
      cancelLabel: "", // a notice: one button
      icon: kind === "rec" ? "video-off" : "camera-off",
      danger: true,
      onConfirm: () => undefined,
    });
  useEffect(() => {
    if (captured) warn("rec");
  }, [captured]);
  useScreenshotListener(() => warn("shot"));
}
