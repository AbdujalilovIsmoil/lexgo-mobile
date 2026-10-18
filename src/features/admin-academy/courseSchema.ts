import { z } from "zod";
import * as rules from "@/shared/form/rules";
import type { CourseLevel } from "@/entities/admin-academy";

export const digitsOnly = (x: string) => x.replace(/\D/g, "");
export const COURSE_EMPTY = { title: "", category: "business", level: "beginner" as CourseLevel, lessons: "", minutes: "", price: "", cover: "", publish: false };

// New course: a title is required; counts and price are whole numbers; the cover is an optional link.
export const courseSchema = z.object({
  title: rules.text(1, 200), category: rules.optText(50), level: z.custom<CourseLevel>(), lessons: rules.optIntText(), minutes: rules.optIntText(),
  price: rules.optIntText(), cover: rules.optUrl, publish: z.boolean(),
});
