import type { RaAck } from "@/entities/remote-assist/model/types";
import { createAcks } from "./acks";

const executed: RaAck = { status: "executed", failureCode: "", result: { applied: true } };
const rejected: RaAck = { status: "rejected", failureCode: "component_not_mounted", result: { applied: false } };
const asked: RaAck = { status: "confirmation_required", failureCode: "", result: { presented: true } };
const confirmed: RaAck = { status: "confirmed", failureCode: "", result: { applied: true } };

function transport(open = true) {
  const socket = jest.fn((_id: string, _a: RaAck) => open);
  const http = jest.fn(async (_id: string, _a: RaAck) => undefined);
  return { socket, http };
}

describe("command acknowledgements", () => {
  it("answers a command exactly once: a second final answer is never sent", async () => {
    const t = transport();
    const acks = createAcks(t);
    expect(await acks.send("c1", executed)).toBe(true);
    expect(await acks.send("c1", executed)).toBe(false);
    expect(await acks.send("c1", rejected)).toBe(false);
    expect(t.socket).toHaveBeenCalledTimes(1);
    expect(t.http).not.toHaveBeenCalled();
    expect(acks.answered("c1")).toBe(true);
    expect(acks.answered("c2")).toBe(false);
  });

  it("a confirmation is announced once, then answered once", async () => {
    const t = transport();
    const acks = createAcks(t);
    await acks.send("c1", asked);
    await acks.send("c1", asked);
    expect(acks.answered("c1")).toBe(false);
    await acks.send("c1", confirmed);
    await acks.send("c1", asked);
    expect(t.socket.mock.calls.map((c) => c[1].status)).toEqual(["confirmation_required", "confirmed"]);
  });

  it("goes over the socket first and over HTTP when it is not open", async () => {
    const t = transport(false);
    const acks = createAcks(t);
    await acks.send("c1", rejected);
    expect(t.socket).toHaveBeenCalledTimes(1);
    expect(t.http).toHaveBeenCalledWith("c1", rejected);
  });

  it("re-sends a recorded answer over HTTP after a reconnect, and nothing it never gave", async () => {
    const t = transport();
    const acks = createAcks(t);
    await acks.send("c1", executed);
    await acks.resend("c1");
    await acks.resend("c9");
    expect(t.http.mock.calls).toEqual([["c1", executed]]);
  });
});
