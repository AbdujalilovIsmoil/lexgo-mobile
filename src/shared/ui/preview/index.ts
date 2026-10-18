// Not part of the shared/ui barrel on purpose: it pulls native modules (audio, video,
// webview, pdf) that should load only where a file is actually previewed.
export { FilePreview } from "./FilePreview";
export { AudioView } from "./AudioView";
export { ZoomImage } from "./ZoomImage";
export { openWith } from "./openWith";
export type { FileRef } from "./useFileSource";
