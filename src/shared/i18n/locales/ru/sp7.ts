import type { Messages } from "../uz";

export const sp7: Messages["sp7"] = {
  open: {
    subscription_preview: "Посмотреть тарифы",
    subscription_checkout: "Открыть платёж",
    document_request: "Открыть документ",
    marketplace_purchase: "Открыть заказ",
    urgent_advokat: "Открыть запрос",
  },
  openChat: "Открыть чат",
  later: "Позже",
  decline: "Отклонить",
  declineTitle: "Отклонить заказ?",
  declineText: "Заказ будет отменён, ничего не спишется. Это действие нельзя отменить.",
  declineDo: "Да, отклонить",
  keep: "Оставить",
  declined: "Заказ отменён",
  declineFailed: "Не удалось отменить заказ",
  linkTelegram: "Привязать Telegram",
  openTelegram: "Открыть Telegram",
  linkFailed: "Не удалось получить ссылку Telegram",
  tgOff: "Telegram не привязан, поэтому запрос на подтверждение не отправлен. Привяжите Telegram — оператор отправит запрос заново.",
  tgSent: "Запрос на подтверждение отправлен в Telegram. Подтвердите или отмените кнопкой в боте — статус изменится здесь.",
  tgGeneric: "Подтверждение происходит в Telegram; статус обновится здесь автоматически.",
};
