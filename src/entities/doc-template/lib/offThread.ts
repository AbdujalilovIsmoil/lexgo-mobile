import { createWorkletRuntime, runOnRuntimeAsync, type WorkletRuntime } from "react-native-worklets";
import type { DocTemplate } from "./match";
import { slimTemplates } from "./slim";

let runtime: WorkletRuntime | null = null;

// Parses the catalogue's JSON text and keeps the slim rows on a worker runtime, so the 9 MB parse never stops the JS thread (touches, the sidebar and
// animations kept freezing for seconds while it ran). The text is copied across once and only the few hundred slim rows come back. Where a worker
// runtime is not available (tests, an old build) the same function runs here.
export async function parseTemplates(text: string): Promise<DocTemplate[]> {
  try {
    runtime ??= createWorkletRuntime({ name: "templates" });
    return await runOnRuntimeAsync(runtime, slimTemplates, text);
  } catch {
    return slimTemplates(text);
  }
}
