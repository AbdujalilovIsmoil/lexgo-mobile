import { http } from "@/shared/api";
import { asNum, asStr, listFrom } from "@/shared/lib/json";
import { normRecord } from "@/shared/lib/adm/record";
import type { Course, CourseInput } from "../model/types";

const norm = (v: unknown): Course => {
  const r = normRecord(v);
  const p = r.payload;
  return { id: r.id, workId: r.workId, title: r.title, status: r.status, price: r.price, category: asStr(p.category), level: asStr(p.level), lessons: asNum(p.lessons_count), minutes: asNum(p.duration_min), cover: asStr(p.cover_url), createdAt: r.createdAt };
};

// GET /academy/courses — every course incl. drafts (the client catalogue /academy/courses/catalog hides drafts).
export const listCourses = async () => listFrom(await http("/academy/courses"), "items", "data").map(norm).filter((c) => c.id);

// POST /academy/courses (academy.manage). The API has no update / delete for courses.
export const createCourse = async (i: CourseInput) =>
  norm(await http("/academy/courses", { method: "POST", body: {
    record_type: "course", title: i.title, status: i.status, price: i.price,
    payload: { category: i.category, level: i.level, lessons_count: i.lessons, duration_min: i.minutes, cover_url: i.cover },
  } }));
