import type { Messages } from "../uz";

export const dm2: Messages["dm2"] = {
  status: {
    questionnaire: "Заполняется",
    draft: "Черновик",
    ready_to_generate: "Готов к созданию",
    payment_pending: "Ожидается оплата",
    payment_required: "Ожидается доплата",
    awaiting_payment: "Ожидается оплата",
    pending_payment: "Ожидается оплата",
    lawyer_review_requested: "Отправлено адвокату",
    open_pool: "Ждём дежурного адвоката",
    claimed: "Адвокат взял в работу",
    lawyer_review: "Адвокат готовит",
    file_ready: "Документ готов",
    rated: "Оценён",
    closed: "Закрыт",
    payment_cancelled: "Оплата отменена",
    payment_rejected: "Оплата отклонена",
    cancelled: "Отменён",
    rejected: "Отклонён",
  },
  next: { draft: "Заполните данные и создайте документ", payment: "Ожидается подтверждение оплаты", review: "Дежурный адвокат работает — следите здесь", ready: "Скачайте готовый документ" },
  step: { fill: "Данные", pay: "Оплата", review: "Адвокат", ready: "Готово" },
  stepState: {
    done: "Готово",
    now: "Сейчас здесь",
    todo: "Далее",
    skip: "Не нужно",
    fail: "Остановлено",
    paid: "Оплачено",
  },
};
