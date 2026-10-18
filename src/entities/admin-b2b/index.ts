export type { B2bClient, B2bDocument, ClientDraft, DocKind, DocRequest } from "./model/types";
export { STAGES, stageLabel, stageTone, stageColor } from "./model/stages";
export { VAT_PERCENT } from "./api/docApi";
export { b2bKeys, useClients, useAddClient, useSetStage, useMakeDocument } from "./model/queries";
export type { B2bProduct, B2bTask, PipelineItem, PipelineStage, ProductInput, TimelineEvent } from "./model/typesExtra";
export { usePipeline, useTimeline, useB2bTasks, useProducts, useAddProduct } from "./model/extraQueries";
