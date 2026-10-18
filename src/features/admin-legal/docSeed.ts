import type { ConsentDoc } from "@/entities/admin-legal";

export const BLANK = { slug: "", version: "1.0", title: "", body: "", active: true, major: true };

// The form values a sheet opens with (a new version keeps the slug, an in-place edit also keeps the re-accept flag).
export const seedValues = (seed: Partial<ConsentDoc> | null, isEdit: boolean) => ({ ...BLANK, slug: seed?.slug ?? "", version: seed?.version ?? "1.0", title: seed?.title ?? "", body: seed?.body ?? "", active: seed?.active ?? true, major: isEdit ? !!seed?.major : true });
