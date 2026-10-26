import { translate } from "./useT";

jest.mock("@react-native-async-storage/async-storage", () => ({ getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn() }));

describe("translate", () => {
  it("reads the chosen language, loading ru / en on first use", () => {
    expect(translate("uz", "cal.next")).toBe("Kelgusi");
    expect(translate("ru", "cal.next")).toBe("Впереди");
    expect(translate("en", "cal.next")).toBe("Upcoming");
  });

  it("falls back to Uzbek, then to the key", () => {
    expect(translate("ru", "no.such.key")).toBe("no.such.key");
  });
});
