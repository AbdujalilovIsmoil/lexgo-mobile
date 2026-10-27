// Service page runtime configuration (TZ.md §4 Marketplace Review): duration, rules for the client, guarantees, the checklist preview.
export const srt = {
  srt: {
    dur: {
      minute: "{n, plural, one {# минута} few {# минуты} many {# минут} other {# минуты}}",
      hour: "{n, plural, one {# час} few {# часа} many {# часов} other {# часа}}",
      day: "{n, plural, one {# день} few {# дня} many {# дней} other {# дня}}",
      bizDay: "{n, plural, one {# рабочий день} few {# рабочих дня} many {# рабочих дней} other {# рабочего дня}}",
      bizTime: "{time} в рабочие дни",
    },
    review: {
      title: "Сначала специалист изучит запрос",
      time: "Срок изучения: {time}",
      note: "Специалист изучит ваш запрос и подтвердит срок выполнения.",
    },
    check: {
      title: "Что сделает специалист",
      required: "Обязательно",
    },
    rules: {
      title: "Правила услуги",
      version: "Версия {v}",
      more: "Читать полностью",
      less: "Свернуть",
    },
    g: {
      title: "Гарантии услуги",
      when: "Когда: {text}",
      how: "Решение: {text}",
      within: "Срок решения: {time}",
    },
    safe: {
      title: "Покупка через LexGo",
      fact: "Оплата, чат и звонки проходят через LexGo.",
    },
    w: {
      subtitle: "Если с заказом проблема, отправьте заявку здесь.",
      terms: "Гарантии услуги указаны на её странице.",
      review: "Решение принимается после рассмотрения заявки.",
      status: "Статус заявки обновляется в списке ниже.",
    },
    error: "Не удалось загрузить условия услуги.",
  },
};
