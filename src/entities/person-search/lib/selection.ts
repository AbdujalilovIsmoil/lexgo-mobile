import type { Person } from "../model/usePeople";

export const isPicked = (list: Person[], id: string): boolean => list.some((p) => p.id === id);

/** Adds the person to the end of the list, or removes them when already there (order of the others never changes). */
export const toggle = (list: Person[], p: Person): Person[] => (isPicked(list, p.id) ? list.filter((x) => x.id !== p.id) : [...list, p]);

export const removeId = (list: Person[], id: string): Person[] => list.filter((p) => p.id !== id);

/** The name shown under a chip: the first word of the name, else the phone, else "?". */
export const firstName = (p: Pick<Person, "name" | "phone">): string => p.name.trim().split(/\s+/)[0] || p.phone || "?";

/** One-line subtitle of a result row: phone when known, else the role and public id. */
export const subtitleOf = (p: Person, role: string): string => p.phone || [role, p.lexgoId].filter(Boolean).join(" · ");

/** Label of the picker's primary button: "Done" with nothing picked, "Done · 3" otherwise. */
export const doneLabel = (n: number, plain: string, withCount: (n: number) => string): string => (n > 0 ? withCount(n) : plain);

/** The "Done" button is off while fewer than `min` people are picked. */
export const canFinish = (n: number, min: number): boolean => n >= min;
