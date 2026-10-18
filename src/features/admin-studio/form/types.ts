import type { ComponentType } from "react";
import type { StudioConstructor, StudioPayload } from "@/entities/admin-studio";

export type Errors = Record<string, string>;
export type EditorFile = { hasFile: boolean; fileName: string; versionId: string };
export type PickedFile = { uri: string; name: string };

export type EditorProps = {
  code: string;
  ctor: StudioConstructor | null;
  payload: StudioPayload;
  onChange: (next: StudioPayload) => void;
  errors: Errors;
  readOnly: boolean;
  file: EditorFile | null;
  onUploadFile: ((file: PickedFile) => Promise<void>) | null;
};

// `handled` = payload keys the editor draws itself; the rest of the schema is drawn by SchemaFields.
export type EditorEntry = {
  Editor: ComponentType<EditorProps>;
  validate: (payload: StudioPayload) => Errors;
  emptyPayload: () => StudioPayload;
  handled: string[];
};
