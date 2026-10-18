import type { Messages } from "../uz";

export const admReg: Messages["admReg"] = {
  lead: "Заявки юристов и адвокатов на регистрацию",
  role: { advokat: "Адвокат", yurist: "Юрист", advokat_tashkiloti: "Адвокатская организация" },
  roleLabel: "Роль",
  status: { approval_pending: "Ожидает одобрения", accepted: "Одобрено" },
  accept: "Одобрить",
  reject: "Отклонить",
  acceptTitle: "Одобрить заявку?",
  acceptText: "{name} будет подтверждён как исполнитель.",
  rejectTitle: "Отклонить заявку?",
  rejectText: "Заявка на регистрацию {name} будет отклонена.",
  acceptedDone: "Заявка одобрена",
  rejectedDone: "Заявка отклонена",
  empty: "Заявок нет",
  emptyText: "По выбранным фильтрам заявок не найдено.",
};
