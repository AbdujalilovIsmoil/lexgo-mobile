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
};
