import type { Messages } from "../uz";

export const admNtf: Messages["admNtf"] = {
  lead: "Отправьте пользователям уведомление: в приложении, push, Telegram или email.",
  channel: "Канал",
  body: "Сообщение",
  category: "Категория",
  categoryNote: "Получатель увидит уведомление в своей категории.",
  fillFields: "Заполните заголовок и сообщение.",
  send: "Отправить",
  sending: "Отправка…",
  stop: "Остановить",
  progress: "Отправка… {done}/{total}",
  channels: { push: "Push", telegram: "Telegram", email: "Email", sms: "SMS" },
  cats: {
    orders: "Заказы",
    payments: "Платежи",
    chat: "Чат и звонки",
    documents: "Документы",
    system: "Система",
    marketing: "Маркетинг",
  },
  roles: {
    all: "Все",
    client: "Клиенты",
    yurist: "Юристы",
    advokat: "Адвокаты",
    advokat_tashkiloti: "Адвокатские организации",
    call_center: "Дежурные сотрудники",
    sales: "Продажи",
  },
};
