// Routes of other packages this slice links to (the screens live in their slices).
export const docPath = (id: string): string => `/documents/${encodeURIComponent(id)}`;
export const chatPath = (roomId: string): string => `/chat/${encodeURIComponent(roomId)}`;
export const callPath = (roomId: string, callId: string): string => `/call/${encodeURIComponent(roomId)}?callId=${encodeURIComponent(callId)}`;
export const ratePath = (workId: string): string => `/rate/${encodeURIComponent(workId)}`;
