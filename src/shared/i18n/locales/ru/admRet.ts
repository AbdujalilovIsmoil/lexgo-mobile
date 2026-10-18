import type { Messages } from "../uz";

export const admRet: Messages["admRet"] = {
  atRisk: "В зоне риска",
  churned: "Ушли за месяц",
  retained: "Удержано",
  atRiskTitle: "Клиенты в зоне риска",
  noRisk: "Нет клиентов в зоне риска",
  winBack: "Вернуть",
  winBackDone: "{name} добавлен в очередь возврата",
  adding: "Добавление…",
  upsellTitle: "Рекомендации upsell",
  noUpsell: "Нет рекомендаций",
  reason: { subscription_expiring: "Подписка истекает", no_paid_activity_30_days: "Нет оплат 30 дней", no_paid_history: "Никогда не платил" },
  lastPaid: "Последняя оплата: {date}",
  neverPaid: "Истории оплат нет",
  noClientId: "Этого клиента нельзя добавить в очередь (нет id)",
  demoAction: "Демо-запись — действие не выполняется",
  price: "Цена",
  off: "Модуль удержания отключён на сервере",
  offText: "Сервер отвечает 404 на маршруты /retention. Когда модуль включат, здесь появятся клиенты в зоне риска. Для примера нажмите «Демо».",
};
