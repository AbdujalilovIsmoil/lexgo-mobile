export type PipelineItem = { id: string; name: string; value: number; industry: string; contact: string; updatedAt: string };
export type PipelineStage = { stage: string; count: number; value: number; items: PipelineItem[] };
export type TimelineEvent = { id: string; type: string; title: string; from: string; to: string; createdAt: string };
export type B2bTask = { id: string; title: string; status: string; due: string; clientId: string };
export type B2bProduct = { id: string; workId: string; title: string; status: string; price: number; description: string };
export type ProductInput = { title: string; price: number; description: string };
