// `/secure-files/<uuid>` (or any path holding a uuid) -> the last uuid in it; "" when there is none.
export const fileIdFromPath = (path: string): string => path.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi)?.pop() ?? "";
