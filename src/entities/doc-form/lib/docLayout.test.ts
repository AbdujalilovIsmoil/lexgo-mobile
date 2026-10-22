import { circled, excerpt, layoutDoc, segsOf, slotCount } from "./docLayout";

describe("layoutDoc", () => {
  const text = ["Ijara shartnomasi", "", "ШАРТНОМА", "", "1. Umumiy qoidalar", "Tomonlar [Ijaraga beruvchi] va [Ijarachi] kelishdilar:", "1) Mol-mulk topshiriladi;", "- muddat {Muddat}", "Imzo"].join("\n");
  const kinds = layoutDoc(text).map((b) => b.kind);

  it("the first line is the title, ALL CAPS is a centred heading, a short numbered line is a heading", () => {
    const b = layoutDoc(text);
    expect(b[0]).toMatchObject({ kind: "title" });
    expect(b.find((x) => x.kind === "heading" && x.center)).toBeTruthy();
    expect(b.find((x) => x.kind === "heading" && !x.center && x.segs[0].text.startsWith("1."))).toBeTruthy();
  });
  it("list items keep their marker and a normal line is a paragraph", () => {
    const items = layoutDoc(text).filter((x) => x.kind === "item");
    expect(items.map((x) => (x.kind === "item" ? x.marker : ""))).toEqual(["1)", "-"]);
    expect(kinds).toContain("para");
  });
  it("blank lines become gaps and no line is lost", () => {
    expect(kinds.filter((k) => k === "gap").length).toBe(2);
    expect(layoutDoc("a\n\n\nb").map((x) => x.kind)).toEqual(["title", "gap", "para"]);
  });
  it("marks the spots to fill, in both bracket styles, and counts them", () => {
    expect(segsOf("Tomon [Ijarachi] va {Muddat}.")).toEqual([{ slot: false, text: "Tomon " }, { slot: true, text: "Ijarachi" }, { slot: false, text: " va " }, { slot: true, text: "Muddat" }, { slot: false, text: "." }]);
    expect(slotCount(layoutDoc(text))).toBe(3);
  });
  it("a long numbered sentence is a paragraph item, not a heading", () => {
    const b = layoutDoc("T\n\n1. Tomonlar ushbu shartnomaga muvofiq barcha majburiyatlarni bajarishga rozilik bildirdilar, shu jumladan to'lov bo'yicha.");
    expect(b[b.length - 1]).toMatchObject({ kind: "item" });
  });
});

describe("excerpt", () => {
  it("keeps a short text whole", () => expect(excerpt("abc", 10)).toBe("abc"));
  it("cuts at a line end, never inside a [spot]", () => {
    expect(excerpt("line one\nline two is longer [Spot to fill] more", 30)).toBe("line one\nline two is longer");
    expect(excerpt("a long first line of text\nsecond line [Spot] and the rest of it", 40)).toBe("a long first line of text");
    const e = excerpt("aaaa bbbb cccc [Long spot label here]", 22);
    expect(e).not.toContain("[");
  });
});

describe("numbered spots", () => {
  it("numbers the spots in reading order across blocks", () => {
    const b = layoutDoc("T\nA [x] [y]\nB {z}");
    const ns = b.flatMap((x) => ("segs" in x ? x.segs.filter((g) => g.slot).map((g) => g.n) : []));
    expect(ns).toEqual([1, 2, 3]);
  });
  it("circles the first twenty and brackets the rest", () => {
    expect([circled(1), circled(3), circled(20), circled(21)]).toEqual(["①", "③", "⑳", "(21)"]);
  });
});
