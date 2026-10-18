export type CardKind = "folder" | "pdf" | "doc" | "sheet" | "image" | "file";
export type CardTone = { back: string; front: string; front2: string };

// The web's folder palette (--ff-*): one folder shape, coloured by what it holds.
const TONES: Record<CardKind, CardTone> = {
  folder: { back: "#D08C2E", front: "#F0A93B", front2: "#FBBF24" },
  pdf: { back: "#B33A3E", front: "#E05257", front2: "#F1777B" },
  doc: { back: "#1B5FB8", front: "#2F7DE1", front2: "#5AA0F5" },
  sheet: { back: "#0B7A52", front: "#13996A", front2: "#2FBB88" },
  image: { back: "#6A3DE8", front: "#8460F0", front2: "#A489F7" },
  file: { back: "#2A6B78", front: "#37899A", front2: "#4FAABD" },
};

// `ext` is null for a folder.
export function cardKind(ext: string | null): CardKind {
  if (ext === null) return "folder";
  const e = ext.toLowerCase().replace(/^\./, "");
  if (e === "pdf") return "pdf";
  if (/^(docx?|rtf|odt|txt)$/.test(e)) return "doc";
  if (/^(xlsx?|csv|ods)$/.test(e)) return "sheet";
  if (/^(png|jpe?g|gif|webp|heic)$/.test(e)) return "image";
  return "file";
}
export const cardTone = (k: CardKind): CardTone => TONES[k];
