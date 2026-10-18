import { useQuery } from "@tanstack/react-query";
import { listTestOtps } from "../api/otpApi";

export const otpKeys = { all: ["admin-otp"] as const };

// Codes are short-lived: poll while the screen is open so a fresh login attempt shows up.
export const useTestOtps = () => useQuery({ queryKey: otpKeys.all, queryFn: listTestOtps, retry: false, refetchInterval: 15_000 });
