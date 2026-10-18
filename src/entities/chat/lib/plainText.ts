// Markdown → one readable line (history previews, share text).
export function plainText(md: string): string {
  return md
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/(\*\*|__|`|^#{1,4}\s*|^>\s*)/gm, "")
    .replace(/(^|\s)[_*]([^_*\n]+)[_*](?=\s|$)/g, "$1$2")
    .replace(/^\s*[-*•]\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}
