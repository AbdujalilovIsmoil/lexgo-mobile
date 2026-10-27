import { http } from "@/shared/api";
import type { DocRuntime } from "../model/types";
import { normRuntime } from "./normalize";

// Public; with the bearer token (sent whenever someone is signed in) it also carries the account's access per mode.
export const getDocRuntime = async (): Promise<DocRuntime> => normRuntime(await http("/document-service-settings/runtime"));
