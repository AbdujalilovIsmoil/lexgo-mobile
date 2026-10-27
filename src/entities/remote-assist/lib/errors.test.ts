import { parseErrorBody } from "@/shared/api/errors";
import { RA_ERR, raErrorCode, raErrorComponents, raRetryAfter } from "./errors";

describe("remote-assistance error codes", () => {
  it("reads detail.code from an HTTP error and from a socket error frame", () => {
    const http = parseErrorBody(409, { detail: { code: "remote_assist_ui_revision_stale", message: "stale" } });
    expect(raErrorCode(http)).toBe(RA_ERR.revisionStale);
    expect(raErrorCode({ event: "error", detail: { code: "remote_assist_device_session_mismatch" } })).toBe(RA_ERR.deviceMismatch);
    expect(raErrorCode({ code: "remote_assist_session_expired" })).toBe(RA_ERR.sessionExpired);
    expect(raErrorCode(new Error("x"))).toBe("");
  });

  it("respects retry_after_seconds, else the Retry-After header", () => {
    expect(raRetryAfter(parseErrorBody(429, { detail: { code: "remote_assist_rate_limit", retry_after_seconds: 12 } }))).toBe(12);
    expect(raRetryAfter(parseErrorBody(429, { detail: { code: "remote_assist_rate_limit" } }, "7"))).toBe(7);
    expect(raRetryAfter({ detail: { retry_after_seconds: "3" } })).toBe(3);
    expect(raRetryAfter(parseErrorBody(429, {}))).toBe(0);
  });

  it("names the components a secret-component error refers to", () => {
    expect(raErrorComponents(parseErrorBody(403, { detail: { code: "remote_assist_secret_component_blocked", component_id: "profile.pin" } }))).toEqual(["profile.pin"]);
    expect(raErrorComponents({ detail: { component_ids: ["a.b", "a.b", "c.d"] } })).toEqual(["a.b", "c.d"]);
    expect(raErrorComponents({ detail: { code: "x" } })).toEqual([]);
  });
});
