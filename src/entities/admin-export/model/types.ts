import type { Access } from "@/entities/access";
import type { IconName } from "@/shared/ui";

// A pick-one filter an export accepts besides the period (e.g. tasks by status); values go to the API as `param=value`.
export type ExportFilter = { param: string; options: string[]; i18n: string };

export type ExportDef = {
  key: string; // also the i18n key ag2.exp.<key>
  path: string; // GET, returns an .xlsx
  icon: IconName;
  visible: (a: Access) => boolean; // permission-first, same codes the web / backend use
  dates: boolean; // honours date_from / date_to
  filter?: ExportFilter;
};

export type ExportQuery = { from: string; to: string; filter: string };
