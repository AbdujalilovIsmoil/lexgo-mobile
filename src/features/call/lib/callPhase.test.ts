import { callPhase, shouldHangUp, type PhaseIn } from "./callPhase";

const base: PhaseIn = { link: "ringing", callStatus: "active", over: false, isCaller: true, others: [{ status: "invited" }], hadRemote: false, timedOut: false };
const p = (o: Partial<PhaseIn>) => callPhase({ ...base, ...o });

describe("callPhase", () => {
  it("walks connecting -> calling -> live", () => {
    expect(p({ link: "connecting" })).toBe("connecting");
    expect(p({})).toBe("calling");
    expect(p({ link: "live", others: [{ status: "joined" }], hadRemote: true })).toBe("live");
  });
  it("a callee that is alone just waits", () => {
    expect(p({ isCaller: false })).toBe("waiting");
  });
  it("declined by the only invitee", () => {
    expect(p({ others: [{ status: "declined" }] })).toBe("declined");
    expect(p({ others: [{ status: "declined" }, { status: "invited" }] })).toBe("calling");
  });
  it("times out into missed, and a late join still wins", () => {
    expect(p({ timedOut: true })).toBe("missed");
    expect(p({ timedOut: true, link: "live", hadRemote: true })).toBe("live");
  });
  it("a server-side end or expiry closes the call", () => {
    expect(p({ over: true })).toBe("ended");
    expect(p({ callStatus: "cancelled" })).toBe("ended");
    expect(p({ callStatus: "expired" })).toBe("missed");
    expect(p({ callStatus: "expired", isCaller: false })).toBe("ended");
  });
  it("keeps reconnecting and error visible, never a stuck calling screen", () => {
    expect(p({ link: "reconnecting" })).toBe("reconnecting");
    expect(p({ link: "error" })).toBe("error");
    expect(p({ link: "ended" })).toBe("ended");
  });
  it("only declined / missed hang the call up", () => {
    expect(["declined", "missed"].every((x) => shouldHangUp(x as never))).toBe(true);
    expect(shouldHangUp("calling")).toBe(false);
  });
});
