import { useQuery } from "@tanstack/react-query";
import { useIsAuthed } from "@/entities/session";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { calcDeadline, cascadeReminders, createEvent, deleteEvent, listEvents, updateEvent } from "../api/calendarApi";
import type { DeadlineKind, EventInput } from "./types";

export const calKeys = { all: ["pro-calendar"] as const };

export const useEvents = () => {
  const authed = useIsAuthed();
  return useQuery({ queryKey: calKeys.all, queryFn: listEvents, enabled: authed });
};


const inv = [calKeys.all];
export const useCreateEvent = () => useAdminMutation({ mutationFn: (b: EventInput) => createEvent(b), invalidate: inv, success: "aw6.created" });
export const useUpdateEvent = () =>
  useAdminMutation({ mutationFn: ({ id, ...b }: Partial<EventInput> & { id: string; status?: string }) => updateEvent(id, b), invalidate: inv, success: "aw6.saved" });
export const useDeleteEvent = () => useAdminMutation({ mutationFn: (id: string) => deleteEvent(id), invalidate: inv, success: "aw6.deleted" });
export const useCascade = () => useAdminMutation({ mutationFn: (id: string) => cascadeReminders(id), invalidate: inv, success: "aw6.cascaded" });
export const useDeadlineCalc = () =>
  useAdminMutation({ mutationFn: (i: { kind: DeadlineKind; baseDate: string; add: boolean; title: string }) => calcDeadline(i), invalidate: inv });
