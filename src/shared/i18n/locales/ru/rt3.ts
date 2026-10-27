// Rating v3: the public rating and the seller's own rating (Marketplace Enterprise contract §19).
export const rt3 = {
  rt3: {
    title: "Мой рейтинг",
    unrated: "Ещё нет оценок",
    reviews: "{n, plural, one {# оценка} few {# оценки} many {# оценок} other {# оценки}}",
    lead: "Рейтинг складывается из оценок клиентов (45%), завершённых заказов (15%), скорости ответа (10%), доли принятых заказов (10%), подтверждённого опыта (15%) и подтверждённых достижений (5%). Обоснованные жалобы и возвраты его снижают.",
    c: {
      client_reviews: "Оценки клиентов",
      completion_rate: "Завершённые заказы",
      response_score: "Скорость ответа",
      acceptance_rate: "Доля принятых",
      verified_experience: "Подтверждённый опыт",
      verified_achievements: "Подтверждённые достижения",
    },
    m: {
      completed: "Завершённые заказы",
      terminal: "Закрытые заказы",
      response: "Среднее время ответа",
      experience: "Подтверждённый опыт",
    },
    minutes: "{n} мин",
    years: "{n} г.",
    calculated: "Рассчитано: {date}",
    policy: "Правила v{v}",
    failed: "Не удалось получить рейтинг",
  },
};
