import { useQuery } from "@tanstack/react-query";
import { getBioInfo } from "../api/biometrics";

// Device capability (re-read on every visit: the user may enrol a finger / set a passcode in Settings).
export const useBioInfo = () => useQuery({ queryKey: ["auth-lock", "info"], queryFn: getBioInfo, staleTime: 0, gcTime: 0 });
