import { guessCategory, topicOf } from "./category";
import { isClosed, isUrgent, isWaiting, subjectFrom, ticketTitle } from "./status";

describe("support status helpers", () => {
  it("classifies statuses and priorities", () => {
    expect(isClosed("resolved")).toBe(true);
    expect(isClosed("open")).toBe(false);
    expect(isWaiting("reopened")).toBe(true);
    expect(isUrgent("high")).toBe(true);
    expect(isUrgent("normal")).toBe(false);
  });
  it("takes the first sentence as the subject and clips it", () => {
    expect(subjectFrom("To'lov o'tmadi. Iltimos yordam bering")).toBe("To'lov o'tmadi.");
    expect(subjectFrom("a".repeat(200)).length).toBeLessThanOrEqual(80);
  });
  it("replaces a generic title with the request text", () => {
    expect(ticketTitle({ title: "Support", description: "Parolni tiklay olmayapman", lastMessage: "" }, "—")).toBe("Parolni tiklay olmayapman");
    expect(ticketTitle({ title: "Mening savolim", description: "", lastMessage: "" }, "—")).toBe("Mening savolim");
    expect(ticketTitle({ title: "", description: "", lastMessage: "" }, "—")).toBe("—");
  });
});

describe("support topics", () => {
  const allowed = ["payment", "account", "technical", "document"];
  it("guesses a topic from free text in uz / ru / en", () => {
    expect(guessCategory("to'lov o'tmayapti", allowed)).toBe("payment");
    expect(guessCategory("не работает приложение", allowed)).toBe("technical");
    expect(guessCategory("hello", allowed)).toBe("general");
  });
  it("only returns allowed topics and maps aliases", () => {
    expect(guessCategory("tarif", allowed)).toBe("general");
    expect(topicOf("Documents", allowed)).toBe("document");
    expect(topicOf("zzz", allowed)).toBe("");
  });
});
