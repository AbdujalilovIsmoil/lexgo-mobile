import { createContext, useContext } from "react";

// The default frame of every AdminPage below the provider: `secondary` — the pinned SecondaryHeader instead of the plain bar, `ground` —
// the page colour. A page's own props still win. Set once at the root from the role (core/providers): a professional's inner pages all get
// the client's frame (white header, light grey ground, white cards); a client's pages choose theirs one by one (useClientFrame).
export type PageFrame = { secondary?: boolean; ground?: string };

export const PageFrameContext = createContext<PageFrame>({});

export const usePageFrame = (): PageFrame => useContext(PageFrameContext);
