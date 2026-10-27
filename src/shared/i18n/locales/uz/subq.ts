// Subscription quote, plan contract and feature limits (TZ.md subscriptions, 402 codes).
export const subq = {
  subq: {
    price: {
      monthly: "so'm / oy",
      six_month: "so'm · 6 oy",
      yearly: "so'm · 12 oy",
      prepaid_yearly: "so'm · 12 oy, oldindan",
      failed: "Narxni olib bo'lmadi",
      off: "−{sum}",
      promo: "Chegirma",
      until: "{date} gacha",
    },
    gate: {
      title: {
        feature_limit_exhausted: "Limit tugadi",
        active_subscription_required: "Obuna kerak",
        feature_not_in_plan: "Tarifingizda yo'q",
        ai_subscription_required: "AI limiti tugadi",
        plan_required: "Tarif kerak",
      },
      text: {
        feature_limit_exhausted: "«{feature}» limiti shu davr uchun tugadi. Yangilanishini kuting yoki kattaroq tarif tanlang.",
        active_subscription_required: "«{feature}» faqat faol obuna bilan ishlaydi. Tarif tanlang.",
        feature_not_in_plan: "«{feature}» joriy tarifingizga kirmaydi. Shu imkoniyati bor tarifni tanlang.",
      },
      any: {
        feature_limit_exhausted: "Shu davr uchun limit tugadi. Yangilanishini kuting yoki kattaroq tarif tanlang.",
        active_subscription_required: "Faol obunangiz yo'q. Davom etish uchun tarif tanlang.",
        feature_not_in_plan: "Bu imkoniyat joriy tarifingizga kirmaydi.",
        ai_subscription_required: "Umumiy AI limitingiz tugadi. Davom etish uchun tarifni yangilang.",
        plan_required: "Bu imkoniyat uchun mos tarif kerak.",
      },
      plans: "Tariflar",
      open: "Tariflarni ko'rish",
      none: "Bu imkoniyatni ochadigan tarifni tariflar sahifasidan tanlang.",
      sent: "So'rovingiz yuborildi. Tasdiqlangach tarif faollashadi.",
      left: "{feature}: {n} ta qoldi",
    },
    feature: {
      document_constructor: "Hujjat konstruktori",
      ai_document_analysis: "AI hujjat tahlili",
    },
    unit: {
      any: "{n} ta",
      day: "{n} kun",
      document: "{n} ta hujjat",
      request: "{n} ta so'rov",
      download: "{n} ta yuklab olish",
      template: "{n} ta shablon",
    },
    contract: {
      now: "Shu davr shartlari",
      next: "Yangi shartlar",
      nextV: "Yangi shartlar · {n}-versiya",
      was: "Hozir: {v}",
      price: "Keyingi to'lov: {sum}",
    },
  },
};
