import type { Messages } from "../uz";

export const fnd1: Messages["fnd1"] = {
  preview: {
    noPreview: "This format cannot be opened inside the app. Open it in another app.",
    openWith: "Open in another app",
    failed: "Could not load the file.",
    retry: "Retry",
    share: "Share",
    blocked: "This file type can't be opened for your safety.",
    blockedHint: "The app does not open executables, scripts or files with suspicious names.",
    tooLarge: "The file is too large to show inside the app. Open it in another app.",
    renderFailed: "The document could not be shown inside the app. Open it in another app or share it.",
  },
  offline: { banner: "No internet. Waiting for the connection to return.", back: "Back online" },
  gate: { title: "No access", text: "This section is not available for your role or permissions.", back: "Back" },
  common: { loadMore: "Show more", refresh: "Refresh", retry: "Retry", soon: "Coming soon" },
};
