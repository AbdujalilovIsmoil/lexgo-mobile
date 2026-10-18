import { useQuery } from "@tanstack/react-query";
import { get360, listEmployees, listPositions } from "../api/peopleApi";
import { getBoard, getUnit } from "../api/orgApi";
import { hrmKey } from "./keys";

// Reference lists (employees, positions, the org board) are shared by many screens and forms.
export const useEmployees = () => useQuery({ queryKey: hrmKey("employees"), queryFn: listEmployees, retry: false });
export const usePositions = () => useQuery({ queryKey: hrmKey("positions"), queryFn: listPositions, retry: false });
export const useBoard = () => useQuery({ queryKey: hrmKey("board"), queryFn: getBoard, retry: false });
export const useEmployee360 = (id: string) => useQuery({ queryKey: hrmKey("360", id), queryFn: () => get360(id), enabled: !!id });
export const useUnit = (id: string) => useQuery({ queryKey: hrmKey("unit", id), queryFn: () => getUnit(id), enabled: !!id });
