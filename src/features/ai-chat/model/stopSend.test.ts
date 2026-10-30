import { useChatStore } from "./chatStore";
import { runSend, stopSend } from "./sendFlow";

// The answer never comes on its own: it waits until the request is aborted, like a real fetch would.
const mockSend = jest.fn((_c: string, _id: string, _t: string, signal?: AbortSignal) => new Promise((_, reject) => signal?.addEventListener("abort", () => reject(new Error("aborted")))));
jest.mock("@/entities/chat", () => ({
  createChat: jest.fn(async () => ({ id: "chat-1", title: "" })),
  sendMessage: (...a: [string, string, string, AbortSignal?]) => mockSend(...a),
  limitFromError: () => null,
  localId: () => "local-1",
}));
jest.mock("@/shared/api", () => ({ isNetworkError: () => false }));
jest.mock("@/shared/lib/haptics", () => ({ tapHaptic: () => undefined, errorHaptic: () => undefined }));
const mockToast = jest.fn();
jest.mock("@/shared/ui", () => ({ toast: (...a: unknown[]) => mockToast(...a) }));
jest.mock("./chatErrorText", () => ({ chatErrorText: () => "err" }));
jest.mock("./recover", () => ({ recover: async () => undefined }));
jest.mock("@/shared/lib/sessionReset", () => ({ registerSessionReset: () => undefined }));

const flush = () => new Promise((r) => setTimeout(r, 0));

describe("stopSend", () => {
  beforeEach(() => useChatStore.getState().reset());

  it("cancels the question in flight: no longer sending, the question kept, no error, a late answer not shown", async () => {
    const done = runSend("client-1", "Ijara shartnomasi");
    await flush();
    expect(useChatStore.getState().sending).toBe(true);
    stopSend();
    await done;
    const s = useChatStore.getState();
    expect(s.sending).toBe(false);
    expect(s.messages).toHaveLength(1);
    expect(s.messages[0]).toMatchObject({ role: "user", content: "Ijara shartnomasi", pending: false });
    expect(s.messages[0].failed).toBeFalsy();
    expect(mockToast).not.toHaveBeenCalled();
    s.upsert({ id: "a-1", role: "assistant", content: "kech kelgan javob", createdAt: new Date().toISOString() });
    expect(useChatStore.getState().messages).toHaveLength(1);
  });

  it("the next question shows its answer again", async () => {
    const first = runSend("client-1", "birinchi");
    await flush();
    stopSend();
    await first;
    mockSend.mockImplementationOnce(async () => ({ assistant: { id: "a-2", role: "assistant", content: "javob", createdAt: new Date().toISOString() } }));
    await runSend("client-1", "ikkinchi");
    expect(useChatStore.getState().messages.map((m) => m.content)).toContain("javob");
  });
});

describe("stopSend while an answer streams", () => {
  beforeEach(() => useChatStore.getState().reset());

  it("ends the streaming answer where it is and shows no more of it", () => {
    const s = useChatStore.getState();
    s.append({ id: "u-1", role: "user", content: "savol", createdAt: new Date().toISOString() });
    s.append({ id: "a-1", role: "assistant", content: "Javobning boshi", createdAt: new Date().toISOString(), streaming: true });
    stopSend();
    expect(useChatStore.getState().messages[1]).toMatchObject({ content: "Javobning boshi", streaming: false });
    useChatStore.getState().delta("a-1", " davomi");
    expect(useChatStore.getState().messages[1].content).toBe("Javobning boshi");
  });
});
