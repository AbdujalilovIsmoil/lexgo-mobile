import { API_BASE, isApiUrl } from "./env";

describe("isApiUrl", () => {
  it("accepts the API origin and its paths", () => {
    expect(isApiUrl(API_BASE)).toBe(true);
    expect(isApiUrl(`${API_BASE}/files/1`)).toBe(true);
    expect(isApiUrl(`${API_BASE}?a=1`)).toBe(true);
  });
  it("refuses hosts that only start like it", () => {
    expect(isApiUrl(`${API_BASE}.evil.tld/files/1`)).toBe(false);
    expect(isApiUrl(`${API_BASE}@evil.tld/files/1`)).toBe(false);
    expect(isApiUrl(`${API_BASE}:8443/files/1`)).toBe(false);
    expect(isApiUrl("https://evil.tld/?u=" + API_BASE)).toBe(false);
  });
});
