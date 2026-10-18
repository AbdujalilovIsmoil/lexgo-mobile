import { translate } from "@/shared/i18n";
import { fmtUzs, methodLabel, paymentTitle, statusLabel } from "./format";

const t = (k: string, p?: Record<string, string | number>) => translate("uz", k, p);

describe("fmtUzs", () => {
  it("is whole so'm with grouping", () => {
    expect(fmtUzs(149000, t)).toBe("149 000 so'm");
    expect(fmtUzs(0, t)).toBe("0 so'm");
  });
});

describe("statusLabel", () => {
  it("translates known statuses, humanizes unknown ones", () => {
    expect(statusLabel("paid", t)).toBe("To'langan");
    expect(statusLabel("Partially Refunded", t)).toBe("Qisman qaytarilgan");
    expect(statusLabel("some_new_state", t)).toBe("Some new state");
    expect(statusLabel("", t)).toBe("—");
  });
});

describe("paymentTitle", () => {
  it("turns a raw target type into words and keeps real descriptions", () => {
    expect(paymentTitle({ description: "Marketplace xizmati", kind: "order" }, t)).toBe("Marketplace xizmati");
    expect(paymentTitle({ description: "monthly", kind: "subscription_plan" }, t)).toContain("·");
    expect(paymentTitle({ description: "", kind: "subscription_plan" }, t)).toBe(t("py1.kind.subscription_plan"));
  });
  it("never returns an empty title", () => {
    expect(paymentTitle({ description: "", kind: "" }, t)).toBe("—");
    expect(paymentTitle({ description: "some_unknown_kind", kind: "" }, t)).toBe("Some unknown kind");
  });
});

describe("methodLabel", () => {
  it("falls back to the upper-cased provider", () => {
    expect(methodLabel("atmos", t)).toBe("ATMOS");
    expect(methodLabel("", t)).toBe("—");
  });
});
