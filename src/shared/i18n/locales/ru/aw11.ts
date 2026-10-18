import type { Messages } from "../uz";

export const aw11: Messages["aw11"] = {
  months: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
  weekdays: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
  priority: { low: "Низкий", medium: "Средний", high: "Высокий" },
  caseStatus: {
    new: "Новое",
    active: "Активное",
    open: "Открыто",
    investigation: "Следствие",
    court: "Суд",
    appeal: "Апелляция",
    completed: "Завершено",
    archived: "В архиве",
  },
  stage: {
    new: "Новый",
    accepted: "Принято",
    filed: "Подано",
    in_progress: "В работе",
    court: "Суд",
    appeal: "Апелляция",
    completed: "Завершён",
  },
  eventType: {
    hearing: "Судебное заседание",
    investigative: "Следственное действие",
    meeting: "Встреча",
    filing_deadline: "Срок подачи документов",
    appeal_deadline: "Срок апелляции",
    deadline: "Срок",
  },
};
