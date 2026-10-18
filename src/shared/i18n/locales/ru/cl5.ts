import type { Messages } from "../uz";

export const cl5: Messages["cl5"] = {
  next: {
    readConclusion: "Ознакомьтесь с заключением",
    viewAndRate: "Посмотрите результат и оцените",
    followRequest: "Следите за статусом запроса",
    downloadDoc: "Скачайте готовый документ",
    followLawyer: "Следите за работой юриста",
    operatorReviews: "Оператор колл-центра проверяет жалобу",
  },
  pay: { title: "Оплата", free: "Бесплатно", waiting: "Статус обновится, когда сервер подтвердит оплату.", open: "Открыть платежи" },
  rating: {
    title: "Оценка и жалоба",
    left: "Осталось: {time}",
    hint: "В течение 15 минут после завершения можно оценить работу или подать жалобу.",
    cta: "Оценить",
    rated: "Оценено: {date}",
    closed: "Время для оценки и жалобы истекло.",
  },
  complaint: { title: "Жалоба", operator: "Комментарий оператора" },
};
