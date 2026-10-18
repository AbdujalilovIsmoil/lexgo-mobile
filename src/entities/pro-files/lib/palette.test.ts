import { cardKind, cardTone } from "./palette";

it("tells a folder from files and groups extensions like the web", () => {
  expect(cardKind(null)).toBe("folder");
  expect(cardKind("PDF")).toBe("pdf");
  expect(cardKind(".docx")).toBe("doc");
  expect(cardKind("xlsx")).toBe("sheet");
  expect(cardKind("heic")).toBe("image");
  expect(cardKind("zip")).toBe("file");
  expect(cardKind("")).toBe("file");
});
it("has a colour set for every kind", () => expect(cardTone("pdf").back).toBe("#B33A3E"));
