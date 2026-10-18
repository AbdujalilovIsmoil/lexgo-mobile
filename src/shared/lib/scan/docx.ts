import { utf8 } from "./bytes";
import { paragraphsOf, type OcrPage } from "./ocr";
import type { JpegPage } from "./pdf";
import { buildZip } from "./zip";

const NS = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"';
// Printable area of A4 with 0.5" margins, in EMU (1 twip = 635 EMU).
// Kept 2% under the full height: a line holding a picture is a bit taller than the picture, and an overflow would add a blank page.
const BOX = { w: Math.floor((11906 - 1440) * 635 * 0.98), h: Math.floor((16838 - 1440) * 635 * 0.98) };

export type DocxImage = JpegPage & { ext: "jpg" | "png" };

function para(i: number, p: DocxImage): string {
  const k = Math.min(BOX.w / p.width, BOX.h / p.height);
  const cx = Math.round(p.width * k);
  const cy = Math.round(p.height * k);
  // The page break lives on the picture's own paragraph (a separate break paragraph would leave an empty line above the picture).
  const brk = i > 0 ? "<w:pageBreakBefore/>" : "";
  return `<w:p><w:pPr>${brk}<w:spacing w:before="0" w:after="0"/><w:jc w:val="center"/></w:pPr><w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cx}" cy="${cy}"/><wp:docPr id="${i + 1}" name="Scan ${i + 1}"/><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic><pic:nvPicPr><pic:cNvPr id="${i + 1}" name="scan${i + 1}.${p.ext}"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="rId${i + 1}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>`;
}

// A Word document: every scan is a picture on its own page (a real .docx — a zip of XML parts and the images).
export function buildDocx(pages: DocxImage[]): Uint8Array {
  const xml = (s: string) => utf8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n${s}`);
  const body = pages.map((p, i) => para(i, p)).join("");
  const sect = '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="720" w:right="720" w:bottom="720" w:left="720" w:header="0" w:footer="0" w:gutter="0"/></w:sectPr>';
  return buildZip([
    { name: "[Content_Types].xml", data: xml('<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="jpg" ContentType="image/jpeg"/><Default Extension="png" ContentType="image/png"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>') },
    { name: "_rels/.rels", data: xml('<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>') },
    { name: "word/document.xml", data: xml(`<w:document ${NS}><w:body>${body}${sect}</w:body></w:document>`) },
    { name: "word/_rels/document.xml.rels", data: xml(`<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${pages.map((p, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/scan${i + 1}.${p.ext}"/>`).join("")}</Relationships>`) },
    ...pages.map((p, i) => ({ name: `word/media/scan${i + 1}.${p.ext}`, data: p.bytes })),
  ]);
}

const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// A Word document with the recognised text: one paragraph per detected paragraph, every scanned page starts on a new page.
export function buildDocxText(pages: OcrPage[]): Uint8Array {
  const xml = (s: string) => utf8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n${s}`);
  const body = pages
    .map((pg, i) => {
      const paras = paragraphsOf(pg.lines);
      return (paras.length ? paras : [""])
        .map((t, j) => `<w:p><w:pPr>${i > 0 && j === 0 ? "<w:pageBreakBefore/>" : ""}<w:spacing w:after="120"/></w:pPr>${t ? `<w:r><w:t xml:space="preserve">${esc(t)}</w:t></w:r>` : ""}</w:p>`)
        .join("");
    })
    .join("");
  const sect = '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="0" w:footer="0" w:gutter="0"/></w:sectPr>';
  return buildZip([
    { name: "[Content_Types].xml", data: xml('<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>') },
    { name: "_rels/.rels", data: xml('<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>') },
    { name: "word/document.xml", data: xml(`<w:document ${NS}><w:body>${body}${sect}</w:body></w:document>`) },
  ]);
}
