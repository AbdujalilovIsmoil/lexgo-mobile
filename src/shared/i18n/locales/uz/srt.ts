// Service page runtime configuration (TZ.md §4 Marketplace Review): duration, rules for the client, guarantees, the checklist preview.
export const srt = {
  srt: {
    dur: {
      minute: "{n} daqiqa",
      hour: "{n} soat",
      day: "{n} kun",
      bizDay: "{n} ish kuni",
      bizTime: "{time}, ish kunlarida",
    },
    review: {
      title: "Avval ko'rib chiqiladi",
      time: "Ko'rib chiqish muddati: {time}",
      note: "Mutaxassis so'rovingizni ko'rib chiqib, bajarish muddatini tasdiqlaydi.",
    },
    check: {
      title: "Mutaxassis nima qiladi",
      required: "Majburiy",
    },
    rules: {
      title: "Xizmat qoidalari",
      version: "Versiya {v}",
      more: "To'liq o'qish",
      less: "Yig'ish",
    },
    g: {
      title: "Xizmat kafolatlari",
      when: "Qachon: {text}",
      how: "Yechim: {text}",
      within: "Hal qilish muddati: {time}",
    },
    safe: {
      title: "LexGo orqali xarid",
      fact: "To'lov, chat va qo'ng'iroqlar LexGo orqali amalga oshadi.",
    },
    w: {
      subtitle: "Buyurtma bo'yicha muammo bo'lsa, shu yerdan so'rov yuboring.",
      terms: "Xizmat kafolatlari uning sahifasida ko'rsatiladi.",
      review: "Qaror so'rov ko'rib chiqilgandan keyin chiqadi.",
      status: "So'rov holati pastdagi ro'yxatda yangilanadi.",
    },
    error: "Xizmat shartlari yuklanmadi.",
  },
};
