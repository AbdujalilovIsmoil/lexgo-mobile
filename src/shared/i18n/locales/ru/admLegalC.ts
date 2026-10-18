import type { Messages } from "../uz";

export const admLegalC: Messages["admLegalC"] = {
  dirty: { title: "Изменения не сохранены", text: "Если выйти, внесённые правки пропадут.", leave: "Выйти", stay: "Продолжить" },
  hero: { versions: "Версий", ready: "Готово", placeholder: "Заглушка", missing: "Не опубликовано" },
  searchPh: "Название или код документа",
  noResults: "Ничего не найдено",
  view: "Читать",
  rows: "Записей: {n}",
  chars: "{chars} симв. · {words} слов",
  off: { title: "Отключить документ", text: "«{slug}» v{version} перестанет показываться пользователям.", on: "Включить документ", onText: "«{slug}» v{version} снова будет показываться." },
  off404: "Модуль юридических документов отключён",
  off404Text: "Сервер ещё не включил этот раздел.",
};
