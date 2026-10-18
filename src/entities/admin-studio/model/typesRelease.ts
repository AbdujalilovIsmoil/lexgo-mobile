export type ReleaseItem = { objectId: string; code: string; version: string; status: string; ok: boolean; errors: string[] };
// A bundle of approved objects published together (GET /admin/studio/releases). `ok` is the last validation verdict.
export type StudioRelease = {
  id: string; title: string; description: string; environment: string; status: string; ok: boolean | null;
  items: ReleaseItem[]; objectCount: number; createdAt: string; publishedAt: string;
};
export type ReleaseInput = { title: string; description: string; environment: string; objectIds: string[] };
// One row of what runs in production now (GET /admin/studio/runtime); the server's shape is generic, so only the common fields are kept.
export type RuntimeRow = { id: string; code: string; title: string; target: string; version: string; status: string; publishedAt: string };
