import { AI_SLOT, captionFit, fitSize, shortCaption } from "./captionFit";

// Widths at 10 pt of a client's captions: Bosh sahifa / Xizmatlar / Ishlar / Xabarlar (measured, iPhone 17 Pro).
const uz = [57, 46, 27, 41];

describe("captionFit", () => {
  it("keeps full captions where they fit — and never above 10.5 pt", () => {
    const f = captionFit(430, uz, uz.map((x) => x * 0.6), AI_SLOT);
    expect(f.mode).toBe("full");
    expect(f.size).toBeLessThanOrEqual(10.5);
  });
  it("shrinks the size as the screen narrows, never leaving a caption wider than its room", () => {
    for (const w of [440, 402, 393, 390, 375, 360]) {
      const f = captionFit(w, uz, uz, AI_SLOT);
      if (f.mode === "full") expect(uz.reduce((a, b) => a + b, 0) * (f.size / 10) + 4 * 32 + 60 + 44).toBeLessThanOrEqual(w);
    }
  });
  it("on a narrow screen with long words it falls back to the first word, then to no captions", () => {
    const longer = [95, 80, 75, 95]; // Russian-like
    const shorter = [40, 40, 36, 40];
    expect(captionFit(375, longer, shorter, AI_SLOT).mode).not.toBe("full");
    expect(captionFit(320, longer, longer, AI_SLOT).mode).toBe("hidden");
  });
  it("a bar without an AI slot has more room", () => {
    expect(fitSize(390, uz, 0)).toBeGreaterThan(fitSize(390, uz, AI_SLOT));
  });
  it("short caption is the first word", () => {
    expect(shortCaption("Bosh sahifa")).toBe("Bosh");
    expect(shortCaption("Ishlar")).toBe("Ishlar");
  });
});
