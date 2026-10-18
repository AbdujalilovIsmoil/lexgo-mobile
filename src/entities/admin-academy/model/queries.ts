import { useQuery } from "@tanstack/react-query";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { createCourse, listCourses } from "../api/courseApi";
import type { CourseInput } from "./types";

export const courseKeys = { all: ["admin-academy"] as const };
export const useCourses = () => useQuery({ queryKey: [...courseKeys.all, "list"], queryFn: listCourses });
export const useCreateCourse = () => useAdminMutation({ mutationFn: (i: CourseInput) => createCourse(i), invalidate: [courseKeys.all], success: "ag6.course.created" });
