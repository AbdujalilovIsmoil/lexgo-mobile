import type { Messages } from "../uz";

// The seller rating breakdown (the web's marketplace.ratingBreakdown).
export const rbd: Messages["rbd"] = {
  "title": "Как считается рейтинг",
  "titleMine": "Ваш рейтинг",
  "lead": "Учитываются только оплаченные и завершённые услуги; каждый фактор — из 100 баллов.",
  "leadMine": "Рейтинг считается только по реальным, оплаченным и завершённым услугам. Подтяните слабые факторы — и поднимитесь в списке.",
  "reviews": "{n, plural, one {# оценка} few {# оценки} many {# оценок} other {# оценки}}",
  "unrated": "Ещё нет оценок",
  "unratedWhy": "Пока мало реальных оценок",
  "ranking": "Балл в списке",
  "factor": {
    "client_reviews": "Оценки клиентов",
    "completion_rate": "Завершённые заказы",
    "acceptance_rate": "Доля принятых",
    "response_score": "Скорость ответа",
    "verified_experience": "Подтверждённый опыт",
    "sla": "Соблюдение сроков",
    "complaints": "Обоснованные жалобы",
    "cancellations": "Отмены и неответы"
  },
  "hint": {
    "client_reviews": "Оценки клиентов после оплаченных услуг",
    "completion_rate": "Сколько начатых заказов завершено",
    "acceptance_rate": "Сколько отправленных вам заказов вы приняли",
    "response_score": "Как быстро вы отвечаете на новый заказ",
    "verified_experience": "Опыт в категории, подтверждённый колл-центром"
  },
  "completed": "Завершённые заказы",
  "ofN": "{n} / {of}",
  "response": "Среднее время ответа",
  "minutes": "{n} мин",
  "hours": "{n} ч",
  "experience": "Подтверждённый опыт",
  "years": "{n} г.",
  "noExperience": "Ещё не подтверждён",
  "calculatedAt": "Рассчитано: {date}",
  "policy": "Правила рейтинга v{n}",
  "weight": "доля {n}%",
  "coldStart": "Пока оценок мало, доля «Оценок клиентов» считается по остальным факторам — выполняйте первые заказы вовремя и качественно.",
  "penalties": "Штрафы",
  "noPenalties": "Штрафов нет — обоснованных жалоб и возвратов не было.",
  "penComplaints": "Обоснованные жалобы: {n}",
  "penRefunds": "Возвраты: {n}",
  "fold": "{score} баллов · {reviews}"
};
