import type { Messages } from "../uz";

export const admAiRegC: Messages["admAiRegC"] = {
  up: {
    title: "Загрузка регламента из файла",
    lead: "Сервер извлечёт текст из файла и сохранит его как версию регламента.",
    choose: "Выбрать файл",
    rules: ".docx, .doc или .pdf · до 20 МБ",
    badType: "Загрузите файл .docx, .doc или .pdf",
    tooBig: "Файл слишком большой: максимум 20 МБ",
    empty: "Файл пустой",
    needFile: "Сначала выберите файл",
    target: "Регламент",
    submit: "Загрузить",
    done: "Файл загружен: {title} · v{v}",
  },
  gapStatus: {
    open: "Открыт",
    resolved: "Решён",
    closed: "Закрыт",
    ignored: "Пропущен",
    answered: "Отвечен",
  },
  roles: {
    client: "Клиент",
    yurist: "Юрист",
    advokat: "Адвокат",
    lawyer: "Юрист",
    advocate: "Адвокат",
    guest: "Гость",
    staff: "Сотрудник",
    operator: "Оператор",
  },
};
