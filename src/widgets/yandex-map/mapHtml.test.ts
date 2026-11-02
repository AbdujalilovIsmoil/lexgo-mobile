import { mapHtml } from "./mapHtml";

describe("map page", () => {
  const base = { loaderUrl: "https://api-maps.yandex.ru/2.1/?apikey=k&lang=uz_UZ", center: [69.24, 41.3] as [number, number], zoom: 11, debounceMs: 400, pick: false };
  it("asks Yandex for [longitude, latitude] coordinates like the backend", () => {
    expect(mapHtml(base)).toContain("apikey=k&lang=uz_UZ&coordorder=longlat");
    expect(mapHtml({ ...base, loaderUrl: "https://x/?coordorder=latlong" })).not.toContain("coordorder=longlat");
  });
  it("escapes names before they reach the map (no HTML from backend text)", () => {
    const html = mapHtml(base);
    expect(html).toContain("function esc(s)");
    expect(html).toContain("hintContent:esc(m.title)");
  });
  it("switches pick mode without rebuilding the page", () => {
    expect(mapHtml(base)).toContain("setPickMode:function(on){CFG.pick=!!on}");
  });
  it("reports a failed loader so the screen can fall back to the list", () => {
    expect(mapHtml(base)).toContain("post({type:'error',where:'loader'})");
  });
});
