import { http } from "@/shared/api";
import { declineOrder } from "./orderApi";

jest.mock("@/shared/api", () => ({ ...jest.requireActual("@/shared/api"), http: jest.fn() }));
const mockHttp = http as jest.MockedFunction<typeof http>;

describe("declining an assignment (Enterprise contract §4)", () => {
  it("sends reason_code and reason_text, with the web's older reason/note beside them", async () => {
    mockHttp.mockResolvedValue({});
    await declineOrder("o 1", "busy", " Bandman ");
    expect(mockHttp).toHaveBeenLastCalledWith("/orders/o%201/decline", { method: "POST", body: { reason_code: "busy", reason_text: "Bandman", reason: "Bandman", note: "Bandman" } });
    await declineOrder("o2", "conflict_of_interest");
    expect(mockHttp).toHaveBeenLastCalledWith("/orders/o2/decline", { method: "POST", body: { reason_code: "conflict_of_interest", reason_text: undefined, reason: "conflict_of_interest", note: undefined } });
  });
});
