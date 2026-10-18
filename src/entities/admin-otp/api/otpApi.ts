import { http } from "@/shared/api";
import { asDict, asStr, listFrom } from "@/shared/lib/json";
import type { TestOtp } from "../model/types";

// GET /admin/test-otps — staging only (404 in production). Each item is a marketplace-style
// record: the phone is the title, the purpose the record type, the code lives in the payload.
export async function listTestOtps(): Promise<TestOtp[]> {
  return listFrom(await http("/admin/test-otps"), "items", "data").map((x) => {
    const d = asDict(x);
    const p = asDict(d.payload);
    return { id: asStr(d.id), phone: asStr(p.phone ?? d.title), purpose: asStr(p.purpose ?? d.record_type), code: asStr(p.code), createdAt: asStr(d.created_at) };
  });
}
