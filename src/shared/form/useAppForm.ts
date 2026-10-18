import { useForm, type FieldValues, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";

// react-hook-form + a zod schema: errors show once a field was left (or on the first submit) and then follow every keystroke.
export function useAppForm<S extends z.ZodType<FieldValues, FieldValues>>(schema: S, defaults: z.input<S>) {
  return useForm<z.input<S>, unknown, z.output<S>>({ resolver: zodResolver(schema) as unknown as Resolver<z.input<S>, unknown, z.output<S>>, defaultValues: defaults as never, mode: "onTouched", reValidateMode: "onChange" });
}
