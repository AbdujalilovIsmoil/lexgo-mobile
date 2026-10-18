import type { Messages } from "../uz";

export const admAds: Messages["admAds"] = {
  lead: "Продвигаемые объявления и рекламные продукты.",
  empty: "Рекламы пока нет",
  emptyText: "Создайте первый рекламный продукт.",
  create: "Новая реклама",
  editTitle: "Редактировать рекламу",
  titleRequired: "Заголовок обязателен.",
  statusLabel: "Статус",
  statusHint: "Произвольный текст (например: active). Быстрый выбор:",
  created: "Реклама создана",
  saved: "Реклама сохранена",
  deleted: "Реклама удалена",
  types: {
    banner: "Баннер",
    featured: "Рекомендуемое",
    promotion: "Акция",
    boost: "Продвижение",
    ad: "Реклама",
    sponsored: "Спонсорское",
  },
  status: {
    draft: "Черновик",
    active: "Активна",
    paused: "Приостановлена",
    expired: "Истекла",
    pending: "Ожидает",
    approved: "Одобрена",
    rejected: "Отклонена",
    archived: "В архиве",
    deleted: "Удалена",
  },
};
