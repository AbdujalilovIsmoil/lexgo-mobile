import { circled, excerpt, isSignatureCell, layoutDoc, segsOf, signatureCaption, slotCount } from "./docLayout";

const kinds = (t: string) => layoutDoc(t).map((b) => b.kind);

describe("head: recipient block and title", () => {
  const ariza = ["[Sud nomi]ga", "[Ariza beruvchining manzili]da yashovchi", "[Ariza beruvchining F.I.O.]dan", "А Р И З А", "(prokurorni rad etish haqida)", "Beraman ushbu arizani shu haqdaki, da'vogar [Ism] ...", "[F.I.O.]", "имзо", "[sana]"].join("\n");
  it("the lines before the first ALL-CAPS line are the recipient block, that line is the title, a (…) line its subtitle", () => {
    const b = layoutDoc(ariza);
    expect(b[0]).toMatchObject({ kind: "recipient" });
    expect(b[0].kind === "recipient" && b[0].lines).toHaveLength(3);
    expect(b[1]).toMatchObject({ kind: "title" });
    expect(b[2]).toMatchObject({ kind: "subtitle" });
  });
  it("a document that begins with its name has no recipient block: the first line is the title", () => {
    expect(kinds("Da'vo ariza\nSO'RAYMAN:\nbody")[0]).toBe("title");
    expect(kinds("Da'vo ariza\nSO'RAYMAN:\nbody")).not.toContain("recipient");
  });
  it("one line before the ALL-CAPS line is not a block (it is the title of a document that has a heading after it)", () => {
    expect(kinds("Ijara shartnomasi\nШАРТНОМА\ntext")).not.toContain("recipient");
  });
});

describe("tail: the signature row", () => {
  it("three closing lines are one row: the first left, the last right, one between", () => {
    const b = layoutDoc("T\nbody text here\n[F.I.O.]\nимзо\n[sana]");
    const sign = b[b.length - 1];
    expect(sign.kind).toBe("sign");
    expect(sign.kind === "sign" && sign.cells).toHaveLength(3);
  });
  it("two closing lines are one row: one on the left, one on the right", () => {
    const sign = layoutDoc("T\nbody text here\n[sana]\n[F.I.O.]").pop();
    expect(sign?.kind === "sign" && sign.cells).toHaveLength(2);
  });
  it("one line of nothing but spots is split into the row's cells", () => {
    const sign = layoutDoc("T\nbody text here\n[sana][imzo][F.I.O.]").pop();
    expect(sign?.kind === "sign" && sign.cells.map((c) => c[0].text)).toEqual(["sana", "imzo", "F.I.O."]);
  });
  it("one ordinary closing line stays a paragraph", () => {
    expect(kinds("T\nbody text here\nImzo sanasi 5 kun")).not.toContain("sign");
  });
  it("body lines are never swallowed by the row", () => {
    const b = layoutDoc("T\nA long body sentence that is not a signature at all, it goes on and on.\n[F.I.O.]\nимзо");
    expect(b.filter((x) => x.kind === "para")).toHaveLength(1);
  });
  it("a signature cell is the word or a ruled line", () => {
    expect(isSignatureCell(segsOf("имзо"))).toBe(true);
    expect(isSignatureCell(segsOf("________"))).toBe(true);
    expect(isSignatureCell(segsOf("[F.I.O.]"))).toBe(false);
    expect(signatureCaption(segsOf("(имзо)"))).toBe("имзо");
  });
});

describe("body", () => {
  const text = ["Ijara shartnomasi", "", "ШАРТНОМА", "", "1. Umumiy qoidalar", "Tomonlar [Ijaraga beruvchi] va [Ijarachi] kelishdilar:", "1) Mol-mulk topshiriladi;", "- muddat {Muddat}", "Imzo"].join("\n");
  it("a short numbered line is a heading, ALL CAPS a centred heading, list items keep their marker", () => {
    const b = layoutDoc(text);
    expect(b.find((x) => x.kind === "heading" && !x.center)).toBeTruthy();
    expect(b.find((x) => x.kind === "heading" && x.center)).toBeTruthy();
    expect(b.filter((x) => x.kind === "item").map((x) => (x.kind === "item" ? x.marker : ""))).toEqual(["1)", "-"]);
  });
  it("an ALL-CAPS line ending with a colon (SO'RAYMAN:) is a centred heading", () => {
    expect(layoutDoc("T\nbody\nSO'RAYMAN:\n1) x").find((x) => x.kind === "heading")).toMatchObject({ center: true });
  });
  it("a long numbered sentence is an item, not a heading", () => {
    const b = layoutDoc("T\n\n1. Tomonlar ushbu shartnomaga muvofiq barcha majburiyatlarni bajarishga rozilik bildirdilar, shu jumladan to'lov bo'yicha.\nx");
    expect(b.some((x) => x.kind === "item")).toBe(true);
  });
  it("blank lines become gaps", () => {
    expect(kinds("a\n\n\nb")).toEqual(["title", "gap", "para"]);
  });
});

describe("key: value rows", () => {
  const rows = (t: string) => layoutDoc(t).filter((b) => b.kind === "kv");
  it("a short Key: [value] line is a row: key and value apart", () => {
    const r = rows("T\nDa'vogar: [Da'vogarning F.I.O.]\nManzil: [Manzil]\nTelefon raqami: [Telefon]\nbody text of the document that goes on");
    expect(r).toHaveLength(3);
    expect(r[0].kind === "kv" && r[0].key).toBe("Da'vogar");
    expect(r[0].kind === "kv" && r[0].value[0]).toMatchObject({ slot: true, text: "Da'vogarning F.I.O." });
  });
  it("a heading with a colon and no value, a long sentence with a colon and a numbered line are not rows", () => {
    expect(rows("T\nSO'RAYMAN:\nx")).toHaveLength(0);
    expect(rows("T\nTomonlar quyidagicha kelishdilar va rozi bo'ldilar: barcha majburiyatlar bajarilishi shart\nx")).toHaveLength(0);
    expect(rows("T\n1. Narx: 5 000 so'm\nx")).toHaveLength(0);
  });
  it("a long value stays a paragraph", () => {
    expect(rows(`T\nIzoh: ${"uzun matn ".repeat(15)}\nx`)).toHaveLength(0);
  });
  it("spots in a value are numbered with the rest", () => {
    expect(slotCount(layoutDoc("T\nManzil: [Manzil]\nbody [x]"))).toBe(2);
  });
});

describe("spots", () => {
  it("segments both bracket styles", () => {
    expect(segsOf("Tomon [Ijarachi] va {Muddat}.")).toEqual([{ slot: false, text: "Tomon " }, { slot: true, text: "Ijarachi" }, { slot: false, text: " va " }, { slot: true, text: "Muddat" }, { slot: false, text: "." }]);
  });
  it("numbers them in reading order across all block kinds, recipient and signature included", () => {
    const b = layoutDoc("[Sud]ga\n[Manzil]da\n[FIO]dan\nАРИЗА\nbody [x]\n[sana]\nимзо\n[FIO]");
    const ns: number[] = [];
    for (const x of b) {
      const segs = x.kind === "recipient" ? x.lines.flat() : x.kind === "sign" ? x.cells.flat() : "segs" in x ? x.segs : [];
      segs.forEach((g) => g.slot && ns.push(g.n ?? 0));
    }
    expect(ns).toEqual([1, 2, 3, 4, 5, 6]);
    expect(slotCount(b)).toBe(6);
  });
  it("circles the first twenty and brackets the rest", () => {
    expect([circled(1), circled(3), circled(20), circled(21)]).toEqual(["①", "③", "⑳", "(21)"]);
  });
});

describe("excerpt", () => {
  it("keeps a short text whole", () => expect(excerpt("abc", 10)).toBe("abc"));
  it("cuts at a line end, never inside a [spot]", () => {
    expect(excerpt("line one\nline two is longer [Spot to fill] more", 30)).toBe("line one\nline two is longer");
    expect(excerpt("a long first line of text\nsecond line [Spot] and the rest of it", 40)).toBe("a long first line of text");
    expect(excerpt("aaaa bbbb cccc [Long spot label here]", 22)).not.toContain("[");
  });
});
