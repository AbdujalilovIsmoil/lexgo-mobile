import type { Messages } from "../uz";

export const ag5: Messages["ag5"] = {
  count: "Пакетов: {n}", search: "Название или код", empty: "Пакетов нет", emptyText: "Нажмите +, чтобы создать пакет",
  saved: "Пакет сохранён", done: "Готово", saves: "экономия {n}", parts: "Услуг: {c} · этапов: {m}",
  create: "Новый пакет", edit: "Редактирование пакета", formHint: "Услуги, цена и этапы оплаты",
  components: "Услуги", addService: "Добавить услугу", pickService: "Выберите услугу", searchService: "Поиск услуги...", noService: "Услуга не найдена",
  clientPrice: "Цена для клиента", sellerFee: "Оплата исполнителю", kind: "Тип", packagePrice: "Цена пакета", priceHint: "Если пусто, берётся сумма услуг",
  milestones: "Этапы оплаты", criteria: "Критерий приёмки", addMilestone: "Добавить этап", included: "Входит", excluded: "Не входит",
  linesHint: "По одному на строку", refund: "Условия возврата", simHint: "Расчёт цены появится после добавления услуг",
  version: "Версия", region: "Режим региона", approvedAt: "Согласован", preview: "Вид клиента и исполнителя", previewClient: "Видит клиент", previewSeller: "Видит исполнитель",
  kinds: { mandatory: "Обязательная", optional: "Необязательная", choose_one: "Выбрать одну" },
  sim: { price: "Цена пакета", separate: "Цена по отдельности", savings: "Экономия", seller: "Исполнителю", lexgo: "Доля LexGo" },
  act: { edit: "Изменить", submit: "Отправить на согласование", approve: "Согласовать", publish: "Выставить на продажу", stop: "Остановить", clone: "Дублировать", self: "Согласует другой сотрудник" },
  ask: {
    submit: "{name} будет отправлен на согласование.", approve: "Согласовать пакет {name}?",
    publish: "{name} будет выставлен на продажу клиентам.", stop: "{name} будет снят с продажи.",
  },
};
