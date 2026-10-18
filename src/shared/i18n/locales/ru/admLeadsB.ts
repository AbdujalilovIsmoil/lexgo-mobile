import type { Messages } from "../uz";

export const admLeadsB: Messages["admLeadsB"] = {
  region: {
    tashkent: "город Ташкент", samarkand: "Самарканд", fergana: "Фергана", bukhara: "Бухара", namangan: "Наманган", andijan: "Андижан",
    kashkadarya: "Кашкадарья", khorezm: "Хорезм", jizzakh: "Джизак", navoi: "Навои",
  },
  cat: {
    family: "Семья", contract: "Договор", court: "Суд", criminal: "Уголовное", administrative: "Административное", housing: "Жильё", tax: "Налоги",
    labor: "Труд", business: "Бизнес", debt: "Долг", documents: "Документы", general: "Общее", login: "Вход в систему", registration: "Регистрация",
    kanban: "Канбан",
  },
  source: {
    web: "Сайт", referral: "Реферал", ad: "Реклама", ads: "Реклама", organic: "Органика", manual: "Вручную", phone: "Телефон", call: "Звонок",
    chat: "Чат", ai: "Искусственный интеллект", lexgo_ai: "LexGo AI", ai_classify: "Анализ ИИ", social: "Соцсети", seo: "SEO", google: "Google",
    telegram: "Telegram", mobile: "Мобильное приложение", callcenter: "Дежурная служба", login: "Вход в систему", registration: "Регистрация",
    register_start: "Регистрация", seller_register_request: "Заявка продавца", gift: "Подарок", sos: "SOS", template: "Шаблон",
    onboarding: "Онбординг",
  },
  urgency: {
    low: "Низкая", normal: "Средняя", high: "Высокая", critical: "Очень срочно", urgent: "Срочно",
  },
  score: { hot: "Горячий", warm: "Тёплый", cold: "Холодный" },
  lost: {
    price: "Цена", solved_self: "Решил сам", competitor: "Ушёл к другим", no_answer: "Не ответил", no_service: "Нет такой услуги",
    spam: "Спам / дубликат",
  },
  tl: { kanban_move: "Смена этапа", created: "Лид создан", updated: "Лид обновлён", re_engage: "Возвращён в работу" },
  meetNoUser: "Пользователь с этим номером на платформе не найден — клиент должен сначала зарегистрироваться.",
  meetSelf: "Нельзя открыть встречу с самим собой.",
  meetDenied: "Нет права открывать встречи. Обратитесь к администратору.",
  meetMissing: "Для этой функции ожидается backend.",
  meetError: "Не удалось открыть встречу. Попробуйте ещё раз.",
};
