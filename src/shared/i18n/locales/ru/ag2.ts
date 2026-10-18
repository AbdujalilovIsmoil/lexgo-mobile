import type { Messages } from "../uz";

export const ag2: Messages["ag2"] = {
  download: "Скачать в Excel",
  failed: "Не удалось выгрузить",
  sheetHint: "Выберите период и фильтр, файл будет в формате Excel (.xlsx)",
  period: "Период",
  noPeriod: "Все данные (без периода)",
  withPeriod: "Фильтр по периоду",
  count: "Выгрузок: {n}",
  none: "Нет доступных вам выгрузок",
  by: { role: "Роль", status: "Статус" },
  role: { client: "Клиент", yurist: "Юрист", advokat: "Адвокат", advokat_tashkiloti: "Адвокатская организация", manager: "Менеджер", call_center: "Колл-центр", admin: "Админ" },
  exp: {
    dashboard: "Панель управления", system: "Системный отчёт", users: "Пользователи", lawyers: "Специалисты",
    sellerRequests: "Заявки на регистрацию", reviews: "Отзывы", complaints: "Жалобы", tasks: "Задачи",
    payments: "Платежи", payouts: "Выплаты продавцам", subscriptions: "Подписки", plans: "Тарифы подписки",
    categories: "Категории услуг", templates: "Шаблоны документов", orders: "Заказы маркетплейса", sellers: "Продавцы маркетплейса",
    promotions: "Рекламные кампании", leads: "Воронка лидов", studio: "Объекты Студии", hrm: "Аналитика внутреннего отдела",
  },
};
