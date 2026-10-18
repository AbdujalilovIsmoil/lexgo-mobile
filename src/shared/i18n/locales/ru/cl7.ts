import type { Messages } from "../uz";

export const cl7: Messages["cl7"] = {
  unknown: "Раздел не найден",
  unknownText: "Такого списка не существует.",
  kinds: {
    works: { title: "Активные работы", sub: "Ещё не завершённые работы" },
    documents: { title: "Мои документы", sub: "Архив документов" },
    orders: { title: "Заказы", sub: "Ваши заказы маркетплейса" },
    payments: { title: "Платежи", sub: "Ваши платёжные запросы" },
    chats: { title: "Сообщения", sub: "Защищённые чаты" },
  },
  filters: {
    all: "Все",
    ready: "Готово",
    active: "Активные",
    pending: "Ожидают",
    unread: "Непрочитанные",
  },
  empty: {
    documents: "Документов нет",
    documentsText: "Подготовленные документы появятся здесь.",
    orders: "Заказов нет",
    ordersText: "Заказанные в маркетплейсе услуги появятся здесь.",
    payments: "Платежей нет",
    paymentsText: "Платёжные запросы появятся здесь.",
    chats: "Сообщений нет",
    chatsText: "Когда новых сообщений нет, список пуст.",
  },
  payKind: {
    order: "Оплата заказа",
    subscription_plan_telegram_approval: "Оплата подписки",
    subscription_plan: "Оплата подписки",
    document_request: "Оплата документа",
    urgent_advokat: "Оплата срочной услуги",
    document_analysis: "Оплата анализа документа",
  },
};
