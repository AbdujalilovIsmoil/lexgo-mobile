const enc = encodeURIComponent;

// Routes of this module and of the messaging package (cast `as never`: typed routes are generated at dev time).
export const docPath = (id: string): never => `/pro/docs/${enc(id)}` as never;
export const editorPath = (id: string): never => `/pro/docs/${enc(id)}/editor` as never;
export const chatRoute = (roomId: string): never => `/chat/${enc(roomId)}` as never;
export const callRoute = (roomId: string, callId: string): never => `/call/${enc(roomId)}?callId=${enc(callId)}` as never;
