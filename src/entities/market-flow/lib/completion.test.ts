import { completionBody } from "./completion";

const file = { id: "f1", name: "a.pdf", url: "/secure-files/f1" };

describe("completionBody (TZ §9)", () => {
  it("blocks an empty completion", () => {
    expect(completionBody("", [])).toBeNull();
    expect(completionBody("   \n", [])).toBeNull();
  });
  it("accepts text only, files only, or both, in the shape of POST /marketplace/me/orders/{id}/complete", () => {
    expect(completionBody(" done ", [])).toEqual({ result_text: "done" });
    expect(completionBody("", [file])?.result_files).toEqual([{ file_id: "f1", file_name: "a.pdf", download_url: "/secure-files/f1" }]);
    expect(completionBody("x", [file])).toMatchObject({ result_text: "x", result_files: [{}] });
  });
});
