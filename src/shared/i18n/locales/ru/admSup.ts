import type { Messages } from "../uz";

export const admSup: Messages["admSup"] = {
  tabs: { new: "Новые", mine: "Мои", transferred: "Переданные", closed: "Завершённые" },
  st: {
    ai_handling: "Отвечает AI", waiting_operator: "Ожидает оператора", claimed: "Оператор подключён", transferred: "Передано",
    waiting_client_confirm: "Ждёт подтверждения", reopened: "Открыто заново", closed: "Завершён", resolved: "Решён", cancelled: "Отменён",
  },
  cat: {
    general: "Общее", subscription: "Тариф / подписка", payment: "Оплата", marketplace: "Поиск адвоката", documents: "Документы", document: "Документ",
    urgent_advokat: "Срочный адвокат", account: "Аккаунт", technical: "Техническая проблема",
  },
  prio: { low: "Низкая", normal: "Обычная", high: "Высокая", urgent: "Срочная" },
  roles: {
    client: "Клиент", operator: "Оператор", admin: "Админ", yurist: "Юрист", advokat: "Адвокат", org: "Адвокатское образование", sales: "Отдел продаж",
    manager: "Менеджер", system: "Система", ai: "AI-инструктор",
  },
  lead: "Чаты клиентов и специалистов с операторами: берите, отвечайте, передавайте или завершайте.",
  empty: "В этом разделе чатов нет.", emptyText: "Список обновляется автоматически.", oldestFirst: "Дольше всех ждущие — сверху", claim: "Взять",
  claimedOk: "Чат назначен вам", claimTaken: "Этот чат уже взял другой оператор", transfer: "Передать другому оператору", transferDo: "Передать",
  transferOk: "Чат передан другому оператору", transferOff: "Это обращение нельзя передать другому оператору.", operator: "Оператор",
  operatorSearch: "Имя или телефон оператора", operatorNone: "Оператор не найден", client: "Клиент", reasonPh: "Например: специалисту по оплатам",
  reasonRequired: "Укажите причину", close: "Завершить чат", closeDo: "Завершить",
  closeNote: "После завершения клиент сможет писать в этот чат, только открыв его снова.", closedOk: "Чат завершён", resolution: "Итог",
  resolutionPh: "Например: клиенту подобран тариф", resolutionRequired: "Укажите итог", reopen: "Открыть снова", reopenDo: "Открыть чат снова",
  reopenReason: "Что осталось нерешённым? (необязательно)", reopenPh: "Например: оплата всё ещё не проходит",
  reopenedOk: "Чат снова открыт — можете написать оператору", reopenReasonLbl: "Причина повторного открытия", transferReasonLbl: "Причина передачи",
  priority: "Важность", topic: "Тема", urgent: "Срочно", untitled: "Чат с оператором", details: "Обращение", closedLbl: "Закрыто",
  wait: { now: "Только что", min: "Ждёт {n} мин", hour: "Ждёт {h} ч {m} мин", day: "Ждёт {n} дн." }, viewChat: "Чат", ph: "Напишите сообщение…",
  noMessages: "Сообщений пока нет.", loadOlder: "Предыдущие сообщения", readOnly: "Этот чат не назначен вам — только просмотр.", today: "Сегодня",
  yesterday: "Вчера", closedBanner: "Чат завершён", closedAt: "Завершён: {date}", noResolution: "Оператор не оставил итог.",
  contactBlocked: "Нельзя указывать контакты вне платформы. Продолжайте общение внутри системы.",
  sendFailed: "Не отправлено · повторить", callAudio: "Аудиозвонок", callVideo: "Видеозвонок", calling: "Подключаем…",
  callFailed: "Не удалось начать звонок. Попробуйте ещё раз.", callTitle: "Звонок поддержки LexGo · {id}", callTitlePlain: "Звонок поддержки LexGo",
  hero: {
    oldest: "Дольше всех ждёт", search: "Поиск по клиенту, ID или сообщению", noMatch: "Ничего не найдено",
    off: "Очередь операторов отключена", offText: "Сервер пока отключил этот раздел.",
    min: "{n} мин", hour: "{h} ч {m} м", day: "{n} дн",
  },
};
