import { linkTarget } from "./links";

jest.mock("react-native", () => ({ Linking: { openURL: jest.fn(() => Promise.resolve()) } }));

describe("linkTarget", () => {
  it("opens web, mail, phone and the app's own links as they are", () => {
    expect(linkTarget("https://lex.uz/docs/111")).toBe("https://lex.uz/docs/111");
    expect(linkTarget(" http://example.com ")).toBe("http://example.com");
    expect(linkTarget("mailto:info@lexgo.uz")).toBe("mailto:info@lexgo.uz");
    expect(linkTarget("tel:+998901234567")).toBe("tel:+998901234567");
    expect(linkTarget("lexgo://services/abc")).toBe("lexgo://services/abc");
  });
  it("completes the links an AI answer writes without a scheme", () => {
    expect(linkTarget("lexgo.uz/services")).toBe("https://lexgo.uz/services");
    expect(linkTarget("www.lex.uz")).toBe("https://www.lex.uz");
    expect(linkTarget("/services/abc")).toBe("lexgo://services/abc");
  });
  it("never opens other schemes", () => {
    expect(linkTarget("javascript:alert(1)")).toBeNull();
    expect(linkTarget("file:///etc/passwd")).toBeNull();
    expect(linkTarget("intent://scan#Intent;scheme=zxing;end")).toBeNull();
    expect(linkTarget("//evil.example/x")).toBeNull();
    expect(linkTarget("tg://resolve?domain=x")).toBeNull();
  });
});
