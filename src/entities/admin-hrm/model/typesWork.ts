export type Task = {
  id: string; code: string; title: string; description: string; project: string; priority: string; status: string;
  responsibleId: string; responsibleName: string; unitId: string; deadline: string; createdAt: string; completedAt: string;
  checklist: { title: string; done: boolean }[]; progress: number; // progress 0..100, -1 when unknown
};
export type Approval = {
  id: string; type: string; title: string; targetType: string; requesterId: string; approverId: string; status: string;
  comment: string; payload: Record<string, unknown>; decidedAt: string; createdAt: string;
};
export type Message = {
  id: string; threadType: string; senderId: string; recipientId: string; subject?: string; body: string; status: string; readAt: string; createdAt: string;
};
