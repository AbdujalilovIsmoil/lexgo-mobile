export type CourseLevel = "beginner" | "intermediate" | "advanced";
export type Course = { id: string; workId: string; title: string; status: string; price: number; category: string; level: string; lessons: number; minutes: number; cover: string; createdAt: string };
export type CourseInput = { title: string; category: string; level: CourseLevel; lessons: number; minutes: number; price: number; status: "draft" | "active"; cover: string };
