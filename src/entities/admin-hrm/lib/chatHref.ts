// Route of the in-app chat with a colleague (their user id + a name for the header).
export const chatHref = (userId: string, name: string): string => `/manage/internal/chat?peer=${encodeURIComponent(userId)}&name=${encodeURIComponent(name)}`;
