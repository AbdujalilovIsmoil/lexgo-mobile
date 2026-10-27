import { htmlText } from "./htmlText";

describe("htmlText", () => {
  it("turns a Studio rule body into lines and bullets, entities decoded", () => {
    const body = "Ma'lumot oshkor etilmaydi&nbsp;<br><ul><li>agar oshkor qilinsa, javobgarlik bor</li><li>Hech kimga taqdim qilinmaydi&nbsp;</li></ul>";
    expect(htmlText(body)).toBe("Ma'lumot oshkor etilmaydi\n• agar oshkor qilinsa, javobgarlik bor\n• Hech kimga taqdim qilinmaydi");
  });
  it("keeps paragraphs apart and drops every other tag", () => {
    expect(htmlText('<p>Birinchi <b>qism</b></p><p>Ikkinchi <a href="x">havola</a></p>')).toBe("Birinchi qism\nIkkinchi havola");
    expect(htmlText("<div>A</div>\n\n\n\n<div>B</div>")).toBe("A\n\nB");
  });
  it("decodes named and numeric entities once, so escaped markup stays text", () => {
    expect(htmlText("Tom &amp; Jerry &#8212; &#x41;&quot;&#39;")).toBe("Tom & Jerry — A\"'");
    expect(htmlText("&lt;b&gt;not bold&lt;/b&gt;")).toBe("<b>not bold</b>");
    expect(htmlText("&unknown; &#0;")).toBe("&unknown; &#0;");
  });
  it("drops scripts and styles with their content", () => {
    expect(htmlText("<style>p{color:red}</style>Matn<script>alert(1)</script>")).toBe("Matn");
  });
  it("leaves plain text as written (only trimmed)", () => {
    expect(htmlText("  Pul qaytariladi.\n\nAgar mijoz aybi bo'lsa, yo'q. ")).toBe("Pul qaytariladi.\n\nAgar mijoz aybi bo'lsa, yo'q.");
    expect(htmlText("")).toBe("");
  });
});
