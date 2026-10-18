const iso = (d: number) => new Date(Date.now() + d * 86_400_000).toISOString();
const folder = (id: string, name: string, parent = "", extra: object = {}) => ({ id, workId: "FLD-" + id, name, parentId: parent, caseId: "", starred: false, size: 5_400_000, fileCount: 3, folderCount: 1, status: "active", createdAt: iso(-10), ...extra });
const file = (id: string, name: string, ext: string, size: number, folderId = "", extra: object = {}) => ({ id, workId: "FIL-" + id, folderId, caseId: "", name, size, mime: "application/octet-stream", ext, starred: false, status: "active", scan: "clean", createdAt: iso(-2), ...extra });
export const tree = {
  folders: [folder("f1", "Mehnat nizosi", "", { starred: true }), folder("f2", "Shartnomalar"), folder("f3", "Dalillar", "f1")],
  files: [file("a1", "Ariza.pdf", "pdf", 245000), file("a2", "Shartnoma-loyihasi.docx", "docx", 88000, "", { starred: true }), file("a3", "Jadval.xlsx", "xlsx", 1_300_000, "f1"), file("a4", "Dalil-foto.jpg", "jpg", 2_100_000, "f1"), file("a5", "Virus.pdf", "pdf", 900, "", { scan: "infected" })],
  quota: { quotaBytes: 1073741824, usedBytes: 268435456, remainingBytes: 805306368, limitGb: 1 },
};
export const limits = { fileMaxMb: 50, videoMaxMb: 200, allowed: [".pdf", ".docx", ".jpg"], blocked: [".exe"] };
export const docReqs = [{ id: "r1", title: "Pasport nusxasi", message: "Ikki tomonlama", status: "fulfilled", fileName: "pasport.pdf", fileUrl: "", mime: "application/pdf", createdAt: iso(-1) }, { id: "r2", title: "Mehnat daftarchasi", message: "", status: "requested", fileName: "", fileUrl: "", mime: "", createdAt: iso(-0.3) }];
export const timeline = [{ id: "h1", kind: "updated", title: "", stage: "filed", status: "court", nextAction: "Sudga hujjat topshirish", createdAt: iso(-1) }, { id: "h2", kind: "created", title: "", stage: "new", status: "active", nextAction: "", createdAt: iso(-20) }];
