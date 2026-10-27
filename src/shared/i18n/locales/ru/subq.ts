// Subscription quote, plan contract and feature limits (TZ.md subscriptions, 402 codes).
export const subq = {
  subq: {
    price: {
      monthly: "сум / мес",
      six_month: "сум · 6 мес",
      yearly: "сум · 12 мес",
      prepaid_yearly: "сум · 12 мес, предоплата",
      failed: "Не удалось получить цену",
      off: "−{sum}",
      promo: "Скидка",
      until: "до {date}",
    },
    gate: {
      title: {
        feature_limit_exhausted: "Лимит исчерпан",
        active_subscription_required: "Нужна подписка",
        feature_not_in_plan: "Нет в вашем тарифе",
        ai_subscription_required: "Лимит ИИ исчерпан",
        plan_required: "Нужен тариф",
      },
      text: {
        feature_limit_exhausted: "Лимит «{feature}» на этот период исчерпан. Дождитесь обновления или выберите тариф больше.",
        active_subscription_required: "«{feature}» работает только с активной подпиской. Выберите тариф.",
        feature_not_in_plan: "«{feature}» не входит в ваш тариф. Выберите тариф, где эта функция есть.",
      },
      any: {
        feature_limit_exhausted: "Лимит на этот период исчерпан. Дождитесь обновления или выберите тариф больше.",
        active_subscription_required: "У вас нет активной подписки. Чтобы продолжить, выберите тариф.",
        feature_not_in_plan: "Эта функция не входит в ваш тариф.",
        ai_subscription_required: "Общий лимит ИИ исчерпан. Чтобы продолжить, обновите тариф.",
        plan_required: "Для этой функции нужен подходящий тариф.",
      },
      plans: "Тарифы",
      open: "Смотреть тарифы",
      none: "Выберите тариф с этой функцией на странице тарифов.",
      sent: "Заявка отправлена. Тариф включится после подтверждения.",
      left: "{feature}: осталось {n}",
    },
    feature: {
      document_constructor: "Конструктор документов",
      ai_document_analysis: "ИИ-анализ документов",
    },
    unit: {
      any: "{n}",
      day: "{n, plural, one {# день} few {# дня} other {# дней}}",
      document: "{n, plural, one {# документ} few {# документа} other {# документов}}",
      request: "{n, plural, one {# запрос} few {# запроса} other {# запросов}}",
      download: "{n, plural, one {# скачивание} few {# скачивания} other {# скачиваний}}",
      template: "{n, plural, one {# шаблон} few {# шаблона} other {# шаблонов}}",
    },
    contract: {
      now: "Условия этого периода",
      next: "Новые условия",
      nextV: "Новые условия · версия {n}",
      was: "Сейчас: {v}",
      price: "Следующий платёж: {sum}",
    },
  },
};
