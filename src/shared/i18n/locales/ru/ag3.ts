import type { Messages } from "../uz";

export const ag3: Messages["ag3"] = {
  search: "Имя, телефон или LexGo ID",
  count: "Пользователей: {n}",
  empty: "Пользователи не найдены",
  emptyText: "Измените поиск или фильтр",
  saved: "Сохранено",
  deleted: "Пользователь удалён",
  facts: { id: "LexGo ID", phone: "Телефон", role: "Основная роль", roles: "Роли", perms: "Права", ref: "Реферальный код", by: "Пригласил", verified: "Телефон подтверждён", created: "Зарегистрирован" },
  act: { edit: "Изменить", c360: "Клиент 360", block: "Заблокировать", unblock: "Активировать", del: "Удалить", roles: "Назначить роль" },
  edit: { title: "Редактирование профиля", first: "Имя", last: "Фамилия", middle: "Отчество", status: "Статус аккаунта" },
  confirm: {
    blockTitle: "Заблокировать аккаунт?", blockText: "{name} не сможет войти. Позже его можно снова активировать.",
    delTitle: "Удалить пользователя?", delText: "Аккаунт {name} будет помечен удалённым (soft delete).",
  },
  c360: {
    sub: "Всё о клиенте в одном месте", orders: "Заказы", cases: "Дела", payments: "Платежи", spent: "Потрачено", leads: "Лиды",
    chats: "Чаты", complaints: "Жалобы", reviews: "Отзывы", subs: "Подписки", activity: "Активность", none: "Записей нет",
  },
};
