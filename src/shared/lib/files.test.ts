import { bindAuth } from "@/shared/api";
import { API_BASE } from "@/shared/config/env";
import { downloadAuthed } from "./files";

const mockDownload = jest.fn();
jest.mock("expo-file-system", () => {
  const join = (a: unknown[]) => a.map((x) => (typeof x === "string" ? x : (x as { uri: string }).uri)).join("/");
  class File {
    uri: string;
    constructor(...a: unknown[]) { this.uri = join(a); }
    static downloadFileAsync = (...a: unknown[]) => mockDownload(...a);
  }
  class Directory {
    uri: string;
    exists = true;
    constructor(...a: unknown[]) { this.uri = join(a); }
    create() {}
  }
  return { File, Directory, Paths: { cache: { uri: "file:///cache" } } };
});
jest.mock("expo-sharing", () => ({ isAvailableAsync: async () => false, shareAsync: async () => undefined }));

const reply = (status: number, body: unknown) => ({ ok: status < 400, status, headers: { get: () => null }, json: async () => body }) as unknown as Response;
const fetched = () => (global.fetch as jest.Mock).mock.calls;

beforeEach(() => { global.fetch = jest.fn(); mockDownload.mockReset(); bindAuth(() => "tok", null); });

describe("downloadAuthed", () => {
  it("downloads with the token and returns the local file", async () => {
    mockDownload.mockResolvedValue({ uri: "file:///cache/lexgo-files/a.pdf" });
    await expect(downloadAuthed("/document-requests/1/file", "a.pdf")).resolves.toBe("file:///cache/lexgo-files/a.pdf");
    expect(mockDownload.mock.calls[0][2].headers.Authorization).toBe("Bearer tok");
    expect(fetched()).toHaveLength(0);
  });
  it("turns a refused download into the backend's own ApiError", async () => {
    mockDownload.mockRejectedValue(new Error("Unable to download a file: response has status: 403"));
    (global.fetch as jest.Mock).mockResolvedValue(reply(403, { detail: { code: "document_download_format_disabled" } }));
    await expect(downloadAuthed("/document-requests/1/docx", "a.docx")).rejects.toMatchObject({ status: 403, code: "document_download_format_disabled" });
    expect(fetched()[0][0]).toMatch(/\/document-requests\/1\/docx$/);
  });
  it("asks an absolute URL of our API again by its path", async () => {
    mockDownload.mockRejectedValue(new Error("Unable to download a file: response has status 402"));
    (global.fetch as jest.Mock).mockResolvedValue(reply(402, { detail: { code: "document_subscription_required" } }));
    const url = `${API_BASE}/services/s1/document-template/clean-source-file`;
    await expect(downloadAuthed(url, "a.docx")).rejects.toMatchObject({ status: 402, code: "document_subscription_required" });
    expect(fetched()[0][0]).toBe(url);
  });
  it("keeps the native error for a server error, a lost connection or another host", async () => {
    for (const [path, message] of [["/x", "response has status 500"], ["/x", "The Internet connection appears to be offline."], ["https://cdn.example.com/a.pdf", "response has status 403"]]) {
      const native = new Error(`Unable to download a file: ${message}`);
      mockDownload.mockRejectedValue(native);
      await expect(downloadAuthed(path, "a")).rejects.toBe(native);
    }
    expect(fetched()).toHaveLength(0);
  });
});
