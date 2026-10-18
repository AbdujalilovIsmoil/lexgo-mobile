import { http } from "@/shared/api";
import { asDict, asNum, asStr, listFrom } from "@/shared/lib/json";
import type { AcademyCourse } from "../model/types";

const norm = (v: unknown): AcademyCourse => {
  const d = asDict(v);
  return {
    id: asStr(d.id),
    title: asStr(d.title ?? d.name),
    category: asStr(d.category),
    lessons: asNum(d.lessons_count ?? d.lessons),
    durationMin: asNum(d.duration_min ?? d.duration),
    level: asStr(d.level, "beginner"),
    progress: asNum(d.progress),
    cover: asStr(d.cover_url ?? d.cover),
  };
};

// GET /academy/courses/catalog — published courses of the client catalogue (same call as the web).
export async function listAcademyCourses(): Promise<AcademyCourse[]> {
  return listFrom(await http("/academy/courses/catalog"), "items", "data", "courses").map(norm);
}
