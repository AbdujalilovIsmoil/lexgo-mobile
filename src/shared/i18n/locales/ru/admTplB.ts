import type { Messages } from "../uz";

export const admTplB: Messages["admTplB"] = {
  types: {
    text: "текст",
    date: "дата",
    money: "деньги",
    number: "число",
    phone: "телефон",
    pinfl: "ПИНФЛ",
    checkbox: "флажок",
    multiline: "многострочный",
  },
  fieldsFound: "Найдено полей: {n}",
  noFields: "Метки {{…}} не найдены — проверьте файл.",
  draftNote: "Шаблон в черновике; проверьте типы через «Редактировать» и активируйте.",
  upload: "Загрузить",
  docxDone: "Шаблон создан: полей — {n}.",
  zipDone: "Импортировано шаблонов: {n} (черновики).",
  slugTaken: "Этот slug занят — укажите другой.",
  onlyDocx: "Принимается только DOCX.",
  onlyZip: "Принимается только ZIP.",
  tooBig: "Файл больше 20 МБ.",
  importError: "Импорт не выполнен.",
};
