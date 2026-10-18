// 1536 → "1.5 KB". Whole numbers stay short; 0 / unknown → "".
export function fmtBytes(n: number | undefined): string {
  if (!n || n < 0) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1).replace(/\.0$/, "")} MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(2).replace(/\.?0+$/, "")} GB`;
}
