export type AdminTask = {
  id: string; title: string; description: string; status: string; priority: string; due: string;
  caseTitle: string; assigneeId: string; checklist: { text: string; done: boolean }[]; createdAt: string; updatedAt: string;
};
