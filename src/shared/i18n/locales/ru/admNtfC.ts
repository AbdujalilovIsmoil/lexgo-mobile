import type { Messages } from "../uz";

export const admNtfC: Messages["admNtfC"] = {
  sent: "Отправлено",
  failed: "Не отправлено",
  results: "Результаты: отправлено {ok} из {total}",
  queuedNote: "Каналы, у которых провайдер не подключён, стоят в очереди и будут доставлены после подключения.",
  resultOk: "Отправлено получателям: {n}.",
  resultPartial: "Отправлено: {ok}, не отправлено: {fail}.",
  stopped: "Отправка остановлена: отправлено {done}/{total}.",
  channel: { in_app: "В приложении", push: "Push", telegram: "Telegram", email: "Email", sms: "SMS" },
  delivery: { delivered: "Доставлено", pending: "Ожидает", failed: "Не доставлено", unknown: "Неизвестно" },
};
