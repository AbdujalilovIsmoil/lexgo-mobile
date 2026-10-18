import { concat, crc32, le, utf8 } from "./bytes";

export type ZipEntry = { name: string; data: Uint8Array };

// A ZIP archive without compression ("stored"): enough for a .docx (its images are JPEGs already) and for a bundle of page images.
export function buildZip(entries: ZipEntry[]): Uint8Array {
  const local: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;
  const DOS_TIME = 0;
  const DOS_DATE = (46 << 9) | (1 << 5) | 1; // 2026-01-01
  for (const e of entries) {
    const name = utf8(e.name);
    const crc = crc32(e.data);
    const head = concat([le(0x04034b50, 4), le(20, 2), le(0x0800, 2), le(0, 2), le(DOS_TIME, 2), le(DOS_DATE, 2), le(crc, 4), le(e.data.length, 4), le(e.data.length, 4), le(name.length, 2), le(0, 2), name]);
    central.push(concat([le(0x02014b50, 4), le(20, 2), le(20, 2), le(0x0800, 2), le(0, 2), le(DOS_TIME, 2), le(DOS_DATE, 2), le(crc, 4), le(e.data.length, 4), le(e.data.length, 4), le(name.length, 2), le(0, 2), le(0, 2), le(0, 2), le(0, 2), le(0, 4), le(offset, 4), name]));
    local.push(head, e.data);
    offset += head.length + e.data.length;
  }
  const dir = concat(central);
  return concat([...local, dir, le(0x06054b50, 4), le(0, 2), le(0, 2), le(entries.length, 2), le(entries.length, 2), le(dir.length, 4), le(offset, 4), le(0, 2)]);
}
