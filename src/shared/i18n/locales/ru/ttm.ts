import type { Messages } from "../uz";

export const ttm: Messages["ttm"] = {
  title: "Задачи команды", lead: "Все задачи команды: статус, срок и кому поручены.", create: "Новая задача", retry: "Повторить", empty: "Задач пока нет",
  emptyFiltered: "По этим фильтрам задач нет", clearFilters: "Сбросить фильтры", denied: "У вас нет права просматривать задачи.", all: "Все", updated: "Обновлено: {when}",
  moved: "{code}: переведена в «{status}»", returned: "{code} возвращена на доработку", deletedOk: "{code} удалена", createdOk: "{code} создана", saved: "{code} сохранена",
  noDeadline: "Без срока", overdue: "Просрочено", unassigned: "Не назначена", deleted: "Удалена", edit: "Изменить", assign: "Исполнители", delete: "Удалить", cancel: "Отмена",
  reasonNeeded: "Напишите комментарий — он не может быть пустым.", status: { new: "Новая", in_progress: "В работе", testing: "На тесте", ready: "Готово" },
  act: { in_progress: "Начать", testing: "Отправить на тест", ready: "Подтвердить готовность", return: "Вернуть на доработку" },
  filter: { title: "Фильтры", assignee: "Исполнитель", anyone: "Все", me: "Назначенные мне", unassigned: "Не назначенные", deadline: "Срок", search: "Поиск по коду, названию или описанию", apply: "Применить", reset: "Сбросить" },
  err: { load: "Не удалось загрузить задачи", save: "Не удалось сохранить. Повторите.", network: "Нет интернета. Данные сохранены — повторите.", unavailable: "Сервис временно недоступен. Данные сохранены — повторите позже.", missing: "Задача не найдена или удалена.", forbidden: "Нет прав на это действие.", conflict: "Задача изменена в другом месте — загружено новое состояние.", conflictNotice: "Задача обновлена на другом устройстве. Проверьте изменения и повторите действие." },
  form: { createTitle: "Новая задача", editTitle: "{code} — изменение", assignTitle: "{code} — исполнители", createBtn: "Создать", save: "Сохранить", name: "Название", titleNeeded: "Укажите название задачи.", description: "Описание", deadline: "Срок", date: "Дата", time: "Время", deadlineNeeded: "Выберите срок.", deadlineFuture: "Срок должен быть в будущем.", assignees: "Исполнители", assigneesPh: "Выберите исполнителей", assigneesSearch: "Имя, LexGo ID или телефон", assigneesEmpty: "Никого не найдено", unassignedHint: "Если создать задачу без исполнителя, ответственному придёт запрос в Telegram для назначения.", quick: "Быстрый выбор", today: "Сегодня 18:00", tomorrow: "Завтра 10:00", days3: "Через 3 дня", week: "Через неделю", done: "Готово" },
  detail: { returned: "Возвращена на доработку", deadline: "Срок", assignees: "Исполнители", creator: "Создал", updated: "Последнее изменение", readyBy: "Подтвердил", deleteReason: "Причина удаления", noDescription: "Описание не указано.", history: "История", noHistory: "История пуста." },
  history: { created: "Создана", updated: "Изменена", assignees_changed: "Исполнители изменены", status_changed: "Статус изменён", returned: "Возвращена", deleted: "Удалена" },
  returnTitle: "{code} — вернуть на доработку", returnLead: "Задача вернётся в «В работе». Комментарий уйдёт исполнителям в Telegram и появится в истории.", returnLabel: "Что нужно исправить",
  deleteTitle: "{code} — удаление", deleteLead: "Задача уйдёт из списка, история сохранится.", deleteLabel: "Причина удаления",
  due: { today: "Сегодня {time}", tomorrow: "Завтра {time}", yesterday: "Вчера {time}" }, peopleCount: "Исполнителей: {n}",
  kpi: { created: "Выдано сегодня", done: "Выполнено сегодня", open: "Не выполнено", openLate: "Просрочено: {n}", unassigned: "Не назначено задач: {n}" },
  progress: { title: "Уровень выполнения", foot: "Из {total} задач готово {done}", late: "Просрочено задач: {n}" },
  alert: { assigned: "Вам назначена задача", returned: "Задача возвращена на доработку", testing: "Задача готова к проверке" },
};
