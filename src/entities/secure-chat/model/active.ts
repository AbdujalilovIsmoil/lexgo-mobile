// The room whose screen is open right now: what arrives in it counts as read at once (no unread badge flicker).
let open = "";
export const setActiveRoom = (id: string): void => { open = id; };
export const activeRoom = (): string => open;
