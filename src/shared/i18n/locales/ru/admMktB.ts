import type { Messages } from "../uz";

export const admMktB: Messages["admMktB"] = {
  status: {
    pending_payment: "Ожидает оплаты",
    paid: "В работе",
    completed: "Завершён",
    cancelled: "Отменён",
    rejected: "Отклонён",
    expired: "Истёк",
    refunded: "Возвращён",
  },
  pay: {
    pending: "Ожидает оплаты",
    paid: "Оплачено",
    cancelled: "Оплата отменена",
    refunded: "Возвращено",
    failed: "Оплата не прошла",
  },
  types: { advokat: "Адвокат", yurist: "Юрист", advokat_tashkiloti: "Адвокатское образование" },
  channels: { chat: "Чат", audio: "Аудиозвонок", video: "Видеозвонок", meeting: "Встреча" },
  providers: { telegram_manual: "Telegram (ручное подтверждение)" },
  actions: {
    marketplace_purchase_request_create: "Создан запрос на покупку",
    marketplace_purchase_approved: "Покупка подтверждена",
    marketplace_purchase_rejected: "Покупка отклонена",
    marketplace_order_paid: "Оплата получена",
    marketplace_order_cancelled: "Заказ отменён",
    marketplace_order_completed: "Заказ завершён",
  },
  confirmStatus: {
    approved: "Подтверждено",
    rejected: "Отклонено",
    pending: "Ожидает ответа",
    cancelled: "Отменено",
    expired: "Истекло",
  },
};
