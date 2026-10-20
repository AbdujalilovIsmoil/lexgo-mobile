import type { Messages } from "../uz";

export const admStudioD: Messages["admStudioD"] = {
  cards: { services: "Услуги", packages: "Пакеты", total: "всего", active: "активно", inactive: "неактивно", incomplete: "не завершено", create: "Создать", open: "Список" },
  journeys: {
    title: "Маршруты запуска", sub: "Пошаговые процессы создания", empty: "Маршрутов нет", emptyText: "Создайте новую услугу или пакет по шагам.",
    new: "Новый маршрут", name: "Название", namePh: "Например: услуга анализа договора", type: "Тип", start: "Начать", progress: "{done}/{total} шагов", step: "Шаг", resume: "Продолжить",
    markDone: "Отметить выполненным", markUndone: "Снять отметку", openForm: "Открыть форму", abandon: "Отменить", archive: "В архив", restore: "Восстановить",
    abandonQ: "Отменить маршрут?", archiveQ: "Отправить маршрут в архив?", done: "Выполнено", current: "Текущий", missing: "Ожидает", required: "Обязательный",
    status: { draft: "Черновик", in_progress: "В процессе", completed: "Завершён", abandoned: "Отменён", archived: "В архиве" },
    types: { service: "Простая услуга", marketplace_service: "Услуга и пакет", document_service: "Услуга по документам", subscription: "Тариф", consultation: "Консультация", promotion: "Реклама", integration: "Интеграция" },
    created: "Маршрут создан", updated: "Обновлено", all: "Все", active: "Активные",
  },
  approvals: {
    select: "Выбрать", selected: "Выбрано: {n}", selectAll: "Все", clear: "Сброс", publishN: "Опубликовать ({n})", publishTitle: "Опубликовать выбранное", publishText: "Будет опубликовано объектов: {n}.",
    notePh: "Комментарий (необязательно)", publish: "Опубликовать", publishedN: "Опубликовано: {n}", failedN: "Не удалось: {n}", resultTitle: "Результат", ok: "Опубликовано", close: "Закрыть",
    more: "Ещё", overdue: "Обработать просроченные", overdueQ: "Эскалировать просроченные шаги?", overdueOk: "Просроченные обработаны", overdueBadge: "просрочено", deadline: "Срок",
    reassign: "Заменить", reassignTitle: "Замена согласующего", from: "Кого", to: "Кем", message: "Сообщение", messagePh: "Причина замены (необязательно)", pick: "Выберите", search: "Имя или код",
    reassigned: "Согласующий заменён", noUsers: "Пользователи не найдены", approvers: "Согласующие",
  },
  k02: {
    duration: "Срок выполнения", durationHint: "Срок начинается, когда продавец принимает заказ, а не когда клиент купил.", value: "Значение", unit: "Единица",
    units: { minute: "Минуты", hour: "Часы", day: "Дни" }, calendar: "Счёт дней", calendars: { calendar: "Календарные дни", business_days: "Рабочие дни" },
    businessNote: "Считаются только понедельник–пятница, суббота и воскресенье пропускаются.",
    template: "Шаблон документа", mode: "Требование шаблона", modes: { required: "Обязателен", optional: "Необязателен", not_required: "Не нужен" },
    source: "Источник шаблона", sources: { catalog: "Из каталога", upload: "Загрузка", catalog_or_upload: "Каталог или загрузка" }, catalog: "Шаблон из каталога",
    factors: "Ценовые факторы", factorsHint: "Значение фактора можно изменить только для этой услуги; общий фактор не меняется.", factor: "Фактор", override: "Значение для этой услуги",
    adjust: "Тип", adjusts: { fixed: "Сумма", percent: "Процент" }, amount: "Значение", sharedValue: "Если пусто, используется значение общего фактора.", overrideOn: "Изменить значение", overrideOff: "Общее значение",
    checklist: "Чек-лист выполнения", checklistHint: "Каждый пункт отмечает продавец; можно потребовать доказательства.", addRow: "Добавить пункт", rowTitle: "Название пункта", rowDesc: "Описание",
    rowRequired: "Обязательный пункт", proof: "Способы подтверждения", methods: { checkbox: "Отметка", comment: "Комментарий", image: "Фото", file: "Файл" }, locked: "Отметка есть всегда",
    needed: "обязательно", legacy: "Шаблон чек-листа", legacyHint: "Старый способ; для новой услуги используйте список выше.",
    rules: "Правила", sharedRules: "Существующие правила", inlineRules: "Новые правила для этой услуги", inlineRulesHint: "Не попадают в общую библиотеку.", ruleTitle: "Название правила", ruleBody: "Текст", addRule: "Добавить правило",
    guarantees: "Гарантии", sharedGuarantees: "Существующие гарантии", inlineGuarantees: "Новые гарантии для этой услуги", inlineGuaranteesHint: "Видны только в этой услуге.", guaranteeTitle: "Название гарантии", guaranteeBody: "Описание", addGuarantee: "Добавить гарантию",
    terms: "Поисковые слова", termsHint: "Поисковые слова и теги для ИИ. Подсказки не сохраняются сами: добавляется только выбранное.", suggest: "Подсказки ИИ", suggesting: "Подбираем…", retry: "Повторить",
    suggestions: "Подсказки", addSelected: "Добавить выбранные", needTitle: "Сначала заполните название и описание.", noneNew: "Новых подсказок нет.",
    errors: { service_context_required: "Нет названия или описания.", ai_provider_unavailable: "ИИ-сервис не настроен.", ai_generation_failed: "Запрос к ИИ не выполнен, повторите.", ai_response_invalid: "Ответ ИИ в неверном формате.", ai_response_empty: "ИИ не нашёл подходящих вариантов." },
  },
};
