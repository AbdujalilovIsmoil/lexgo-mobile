import { useEffect, useRef, useState } from "react";
import { draftKey, type Draft, type StudioDetail, type StudioPayload } from "@/entities/admin-studio";
import { editorFor } from "../editors";

const fromDetail = (d: StudioDetail): Draft => ({ title: d.title, payload: { ...d.payload } });

// The editable copy of an object: title + payload, "dirty" against the last applied server copy.
// A newer server copy replaces the draft only when it is clean; otherwise `remote` raises a banner.
// `seed` (new draft of a published record): null while its form context loads, a Draft once it is there.
export function useDraft(detail: StudioDetail | null, newCode: string, seed?: Draft | null) {
  const [draft, setDraft] = useState<Draft | null>(() => (newCode && seed === undefined ? { title: "", payload: editorFor(newCode).emptyPayload() } : null));
  const [base, setBase] = useState(() => draftKey(draft));
  const [remote, setRemote] = useState(false);
  const seen = useRef("");
  const dirty = draft !== null && draftKey(draft) !== base;
  const dirtyRef = useRef(dirty);
  useEffect(() => void (dirtyRef.current = dirty));

  const [seeded, setSeeded] = useState<Draft | null>(null);
  if (seed && newCode && seed !== seeded) {
    setSeeded(seed);
    setDraft(seed);
    setBase(draftKey(seed));
  }

  const apply = (d: StudioDetail) => {
    const next = fromDetail(d);
    seen.current = `${d.updatedAt}|${d.currentVersionId}|${d.status}`;
    setDraft(next);
    setBase(draftKey(next));
    setRemote(false);
  };

  useEffect(() => {
    if (!detail) return;
    const stamp = `${detail.updatedAt}|${detail.currentVersionId}|${detail.status}`;
    if (stamp === seen.current) return;
    if (dirtyRef.current && seen.current) {
      seen.current = stamp;
      setRemote(true);
    } else {
      const next = fromDetail(detail);
      seen.current = stamp;
      setDraft(next);
      setBase(draftKey(next));
      setRemote(false);
    }
  }, [detail]);

  return {
    draft,
    dirty,
    remote,
    apply,
    setTitle: (v: string) => setDraft((d) => d && { ...d, title: v.slice(0, 200) }),
    setPayload: (p: StudioPayload) => setDraft((d) => d && { ...d, payload: p }),
  };
}
