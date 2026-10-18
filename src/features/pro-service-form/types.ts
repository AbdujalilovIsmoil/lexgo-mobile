import type { ServiceStatus } from "@/entities/pro-service";

// The catalogue service chosen in the form.
export type PickedService = { id: string; name: string; category: string; catalogPrice: number; advokatRequired: boolean; slug: string };

export type FormValues = { price: string; note: string; status: ServiceStatus };
