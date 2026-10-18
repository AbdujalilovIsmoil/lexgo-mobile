import type { Messages } from "../uz";

export const admCcC: Messages["admCcC"] = {
  cardNoAccess: "У вашей роли нет доступа к полной карточке клиента (заказы, платежи, история).",
  sumOrders: "Заказы", sumSpent: "Всего оплачено", sumLeads: "Лиды",
  sumChats: "Чаты", sumComplaints: "Жалобы", sumSubs: "Активная подписка",
  tab: { orders: "Заказы", payments: "Платежи", leads: "Лиды", activity: "Последние действия" },
  none: { orders: "Заказов нет.", payments: "Платежей нет.", leads: "Лидов нет.", activity: "Действий нет." },
  act: {
    login: "Вошёл в систему", logout: "Вышел из системы", ai_classify: "Запросил AI-анализ", document_analysis: "Анализ документа",
    order_create: "Оформил заказ", payment_confirmed: "Платёж подтверждён", gift: "Купил подарок", sos: "Нажал SOS", complaint: "Отправил жалобу",
    review: "Оставил оценку", call_center_call: "Звонок дежурной службы", secure_chat_create: "Открыл чат",
  },
  clStatus: { active: "Активен", inactive: "Неактивен", lead: "Лид" },
  payKind: {
    subscription_plan_telegram_approval: "Подписка", subscription_renewal: "Продление подписки", call_extension: "Продление звонка",
    document_review_extra_pages: "Проверка документа: доп. страницы", marketplace_order: "Заказ услуги", order: "Заказ услуги",
    document_request: "Шаблон документа", gift: "Подарочная подписка", private_chat: "Приватный чат", subscription_plan: "Подписка",
  },
  src: {
    web: "Сайт", website: "Сайт", referral: "Реферал", ad: "Реклама", ads: "Реклама", organic: "Органика", manual: "Вручную", phone: "Телефон",
    ai_classify: "Анализ ИИ", telegram: "Telegram", call_center: "Дежурная служба", callcenter: "Дежурная служба",
  },
  hours: { open: "Сейчас рабочее время", closed: "Сейчас нерабочее время", dayOff: "Сегодня выходной" },
  logCall: "Записать звонок", callSave: "Сохранить",
  callLogged: "Звонок записан.", noCalls: "Нет звонков.",
  dir2: { incoming: "Входящий", outgoing: "Исходящий" },
  dir3: { incoming: "Входящий", outgoing: "Исходящий", missed: "Пропущен" },
  callSt: { completed: "Завершён", missed: "Пропущен", no_answer: "Нет ответа", busy: "Занято", failed: "Не удался", answered: "Отвечен" },
  res: { answered: "Разговор состоялся", no_answer: "Не ответил", busy: "Занято", callback: "Просил перезвонить", wrong_number: "Неверный номер", note: "Заметка (без звонка)" },
  direction: "Направление", phoneRequired: "Введите номер телефона.",
  topicPh: "Например: консультация по алиментам", duration: "Длительность (мин)",
  nextPh: "Например: перезвонить завтра в 10:00", next: "Следующий шаг",
  min: "{n} мин", sec: "{n} сек",
};
