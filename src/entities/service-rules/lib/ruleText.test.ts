import { decodeEntities, ruleParagraphs } from "./ruleText";

describe("rule body as readable text", () => {
  it("keeps plain text as it is, split into paragraphs on blank lines", () => {
    expect(ruleParagraphs("Birinchi qism.\r\n\r\nIkkinchi qism\nyangi qator")).toEqual(["Birinchi qism.", "Ikkinchi qism\nyangi qator"]);
    expect(ruleParagraphs("  ")).toEqual([]);
    expect(ruleParagraphs("Narx < 5 & shart")).toEqual(["Narx < 5 & shart"]);
  });
  it("turns HTML into paragraphs, line breaks and list items — never raw tags", () => {
    const html = "<h3>Shartlar</h3><p>Sotuvchi <b>javob</b> beradi.<br>24 soat ichida.</p><ul><li>Birinchi</li><li>Ikkinchi</li></ul><ol><li>Bir</li><li>Ikki</li></ol>";
    expect(ruleParagraphs(html)).toEqual(["Shartlar", "Sotuvchi javob beradi.\n24 soat ichida.", "• Birinchi\n• Ikkinchi", "1. Bir\n2. Ikki"]);
  });
  it("drops scripts, styles and comments, and decodes entities", () => {
    expect(ruleParagraphs("<style>p{color:red}</style><p>A&nbsp;&amp;&nbsp;B &laquo;C&raquo; &#8212; &#x41;</p><script>alert(1)</script><!-- x -->")).toEqual(["A & B «C» — A"]);
    expect(decodeEntities("&unknown; &#0;")).toBe("&unknown; &#0;");
  });
  it("keeps a link's words and shows a safe address next to them", () => {
    expect(ruleParagraphs('<p>Batafsil: <a href="https://lexgo.uz/oferta">oferta</a>.</p>')).toEqual(["Batafsil: oferta (https://lexgo.uz/oferta)."]);
    expect(ruleParagraphs('<p><a href="https://lexgo.uz">https://lexgo.uz</a> <a href="javascript:alert(1)">bu yerda</a></p>')).toEqual(["https://lexgo.uz bu yerda"]);
  });
});
