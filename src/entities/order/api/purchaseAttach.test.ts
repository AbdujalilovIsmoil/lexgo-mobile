import { MAX_ATTACHMENTS, MAX_VOICES, purchaseBody } from "./purchaseApi";

describe("purchase request: files and voice notes", () => {
  const base = { note: "Muammo", channel: "chat" as const, time: "" };
  it("sends attachments and voice_messages by their uploaded ids", () => {
    const b = purchaseBody({ ...base, attachments: [{ file_id: "f1", name: "shartnoma.pdf" }], voices: [{ file_id: "v1", duration_ms: 24000 }] });
    expect(b.attachments).toEqual([{ file_id: "f1", name: "shartnoma.pdf" }]);
    expect(b.voice_messages).toEqual([{ file_id: "v1", duration_ms: 24000 }]);
  });
  it("leaves both out when there is nothing attached", () => {
    const b = purchaseBody(base);
    expect(b).not.toHaveProperty("attachments");
    expect(b).not.toHaveProperty("voice_messages");
  });
  it("never sends more than the backend accepts (20 files, 10 voice notes)", () => {
    const many = Array.from({ length: 30 }, (_, i) => ({ file_id: `f${i}`, name: `${i}.pdf` }));
    const voices = Array.from({ length: 15 }, (_, i) => ({ file_id: `v${i}`, duration_ms: 1000 }));
    const b = purchaseBody({ ...base, attachments: many, voices });
    expect((b.attachments as unknown[]).length).toBe(MAX_ATTACHMENTS);
    expect((b.voice_messages as unknown[]).length).toBe(MAX_VOICES);
  });
});
