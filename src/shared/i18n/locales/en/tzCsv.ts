import type { tzCsv as Shape } from "../uz/tzCsv";
import { csv1 } from "./csv1";
import { csv2 } from "./csv2";
import { csv3 } from "./csv3";
import { csv4 } from "./csv4";

export const tzCsv: typeof Shape = { csv: { ...csv1, ...csv2, ...csv3, ...csv4 } };
