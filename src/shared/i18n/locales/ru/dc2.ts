import type { Messages } from "../uz";

export const dc2: Messages["dc2"] = {
  title: "Заполнение документа",
  section: "Раздел {n}",
  review: "Проверка",
  extraSection: "Дополнительные сведения",
  step: "Шаг {i} из {n}",
  reviewTitle: "Проверьте данные",
  reviewFix: "Есть незаполненные или неверные поля — исправьте их.",
  reviewOk: "Всё заполнено. Можно создавать документ.",
  missing: "Нужно исправить полей: {n}",
  empty: "не заполнено",
  generate: "Создать документ",
  serverMissing: "Сервер сообщил о незаполненных обязательных полях: {n}.",
  generateFailed: "Не удалось создать документ. Повторите попытку.",
  draftRestored: "Черновик восстановлен",
  draftNow: "только что",
  draftClear: "Очистить черновик",
  draftKeep: "Продолжить",
  clearTitle: "Очистить черновик?",
  clearText: "Все введённые ответы будут удалены.",
};
