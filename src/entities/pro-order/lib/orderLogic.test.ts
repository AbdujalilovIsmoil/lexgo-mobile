import { completionBody, fileIdFromPath } from "./complete";
import { hms, msUntil, ratingMsLeft } from "./countdown";
import { isPaused } from "./additional";
import { stageOf } from "./stage";
import type { OrderRating } from "../model/extraTypes";

const rating = (p: Partial<OrderRating>): OrderRating => ({ available: true, closed: false, reason: "", deadlineAt: "", remainingSeconds: 0, stars: 0, comment: "", fetchedAt: 0, ...p });
const file = { fileId: "f1", fileName: "a.pdf", downloadUrl: "/secure-files/f1" };

describe("completionBody (TZ 13)", () => {
  it("blocks an empty completion", () => {
    expect(completionBody("", [])).toBeNull();
    expect(completionBody("   \n", [])).toBeNull();
  });
  it("accepts text only, files only, or both", () => {
    expect(completionBody(" done ", [])).toEqual({ result_text: "done" });
    expect(completionBody("", [file])?.result_files).toEqual([{ file_id: "f1", file_name: "a.pdf", download_url: "/secure-files/f1" }]);
    expect(completionBody("x", [file])).toMatchObject({ result_text: "x", result_files: [{}] });
  });
  it("reads the file id from a secure path", () => {
    const id = "0f8fad5b-d9cb-469f-a165-70867728950e";
    expect(fileIdFromPath(`/secure-files/${id}`)).toBe(id);
    expect(fileIdFromPath(`/secure-chats/r/messages/${id}/file?x=1`)).toBe(id);
    expect(fileIdFromPath("/nothing")).toBe("");
  });
});

describe("countdowns", () => {
  it("formats hours:minutes:seconds", () => {
    expect(hms(24 * 3600 * 1000)).toBe("24:00:00");
    expect(hms(3_661_000)).toBe("01:01:01");
    expect(hms(-5)).toBe("00:00:00");
  });
  it("msUntil follows the backend deadline", () => {
    expect(msUntil("2026-10-14T12:15:00Z", Date.parse("2026-10-14T12:00:00Z"))).toBe(900_000);
    expect(msUntil("2026-10-14T12:15:00Z", Date.parse("2026-10-14T13:00:00Z"))).toBe(0);
    expect(msUntil("", 1)).toBe(0);
  });
  it("rating window: deadline first, remaining seconds as fallback, closed = 0", () => {
    const now = Date.parse("2026-10-14T12:00:00Z");
    expect(ratingMsLeft(rating({ deadlineAt: "2026-10-14T12:10:00Z", remainingSeconds: 900 }), now)).toBe(600_000);
    expect(ratingMsLeft(rating({ remainingSeconds: 900, fetchedAt: now - 60_000 }), now)).toBe(840_000);
    expect(ratingMsLeft(rating({ available: false, deadlineAt: "2026-10-14T12:10:00Z" }), now)).toBe(0);
    expect(ratingMsLeft(rating({ deadlineAt: "2026-10-14T11:00:00Z", remainingSeconds: 900 }), now)).toBe(0);
  });
});

describe("supplemental payment pause (TZ 11)", () => {
  const add = { id: "a", status: "pending", total: 0, note: "", optionIds: [], requestedAt: "", expiresAt: "" };
  it("a waiting_payment or open request pauses the work and keeps the order in the seller's queue", () => {
    expect(isPaused({ status: "waiting_payment" })).toBe(true);
    expect(isPaused({ status: "in_progress", additional: add })).toBe(true);
    expect(isPaused({ status: "in_progress", additional: { ...add, status: "approved" } })).toBe(false);
    expect(stageOf({ status: "waiting_payment", paymentStatus: "pending", additional: add })).toBe("active");
    expect(stageOf({ status: "pending_payment", paymentStatus: "pending", additional: null })).toBe("unpaid");
  });
});
