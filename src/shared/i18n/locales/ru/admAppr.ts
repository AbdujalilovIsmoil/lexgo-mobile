import type { Messages } from "../uz";

export const admAppr: Messages["admAppr"] = {
  lead: "Возвраты и замена юриста требуют одобрения админа и менеджера.",
  item: "Одобрение",
  admin: "Админ",
  manager: "Менеджер",
  adminApprove: "Одобрить (админ)",
  managerApprove: "Одобрить (менеджер)",
  confirmText: "Одобрить запрос {type} {id}?",
  done: "Одобрено",
  empty: "Нет одобрений",
  emptyText: "Ожидающие одобрения появятся здесь.",
  status: { admin_approved: "Одобрил админ", manager_approved: "Одобрил менеджер", partial: "Частично" },
  type: {
    payout: "Выплата",
    refund: "Возврат",
    plan_change: "Смена тарифа",
    verification: "Верификация",
    service: "Услуга",
    ad: "Реклама",
    withdrawal: "Вывод средств",
    advocate_change: "Замена юриста",
    seller_register: "Регистрация исполнителя",
    organization_create: "Создание организации",
  },
};
