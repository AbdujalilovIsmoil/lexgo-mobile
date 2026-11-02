import { payloadOf, roomFor, type AttachItem } from "./attachLogic";

const item = (p: Partial<AttachItem>): AttachItem => ({ key: "k", kind: "file", name: "a.pdf", uri: "file://a", size: 1, durationMs: 0, state: "done", fileId: "f", ...p });

describe("purchase attachments", () => {
  it("sends only finished uploads, files and voice notes apart", () => {
    const p = payloadOf([
      item({ key: "1", fileId: "f1", name: "shartnoma.pdf" }),
      item({ key: "2", state: "uploading", fileId: "" }),
      item({ key: "3", state: "error", fileId: "" }),
      item({ key: "4", kind: "voice", fileId: "v1", durationMs: 24000, name: "voice.m4a" }),
    ]);
    expect(p).toEqual({ attachments: [{ file_id: "f1", name: "shartnoma.pdf" }], voices: [{ file_id: "v1", duration_ms: 24000 }] });
  });
  it("counts the room left under 20 files and 10 voice notes", () => {
    const files = Array.from({ length: 18 }, (_, i) => item({ key: `f${i}` }));
    const voices = Array.from({ length: 10 }, (_, i) => item({ key: `v${i}`, kind: "voice" }));
    expect(roomFor([...files, ...voices], "file")).toBe(2);
    expect(roomFor([...files, ...voices], "voice")).toBe(0);
  });
});
