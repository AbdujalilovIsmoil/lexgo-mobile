export const admSupB = {
  title: "Mijozga yordam", viewOnly: "Faqat ko'rish: bu chat boshqa operatorda, mijoz nomidan amallarni u bajaradi.",
  stale: "Ma'lumot yangilanmadi — oxirgi holat ko'rsatilmoqda.", showAll: "Hammasi ({n})", showLess: "Kamroq ko'rsatish",
  ai: {
    title: "AI bilan suhbat tarixi", lead: "Mijoz AI yordamchidan o'tdi · {n} ta savol", client: "Mijoz", ai: "AI javobi", session: "AI sessiyasi: {id}",
    earlier: "Oldingi {n} ta savol",
  },
  client: { noName: "Ism ko'rsatilmagan", account: "Hisob: {status}", audio: "Audio", video: "Video" },
  overview: {
    heading: "Mijoz holati", subs: "Faol obuna", pending: "To'lov kutilmoqda", docs: "Hujjatlar", orders: "Buyurtmalar", subsEmpty: "Faol obuna yo'q.",
    pendingEmpty: "To'lov kutayotgan so'rov yo'q.", docsEmpty: "Hujjat so'rovlari yo'q.", ordersEmpty: "Buyurtmalar yo'q.", until: "{date} gacha",
    via: "Operator orqali", plan: "Tarif",
  },
  pay: {
    pending: "To'lov tasdiqlanishi kutilmoqda", paid: "To'lov tasdiqlandi", rejected: "To'lov bekor qilindi",
    pendingHint: "Telegram orqali tasdiqlanadi · holat o'zi yangilanadi", paidHint: "Tasdiq Telegram orqali keldi", rejectedHint: "Telegram orqali rad etildi",
    pendingShort: "To'lov kutilmoqda", docPending: "To'lov tasdiqlangach so'rov navbatchi advokatlarga tushadi.",
    marketPaid: "Buyurtma to'landi, mijoz va mutaxassis chati ochildi.", planPaid: "Tarif mijozda faollashdi.",
    planReviewed: "So'rov ko'rib chiqildi — natijani «Mijoz holati»da ko'ring.", rejectedNote: "Kerak bo'lsa, mijoz bilan gaplashib so'rovni qayta yuboring.",
  },
  result: {
    workId: "Ish ID", requestId: "So'rov ID", notified: "Mijozga xabar ketdi", tgSent: "Tasdiqlashga yuborildi",
    tgFailed: "Yetib bormadi — adminga xabar bering", next: "Keyingi bosqich", mode: "Taqsimlash",
  },
  lock: {
    claimTitle: "Avval chatni oling",
    claimText: "Mijoz nomidan amal bajarish uchun chat sizga biriktirilgan bo'lishi kerak. Chatni olganingizdan keyin shu yerda tarif, hujjat, xizmat va tezkor advokat so'rovlarini yarata olasiz.",
    otherTitle: "Chat boshqa operatorda", otherText: "Mijoz nomidan amallarni chat biriktirilgan operator bajaradi.", closedTitle: "Chat yopilgan",
    closedText: "Yopilgan chat bo'yicha mijoz nomidan amal bajarib bo'lmaydi.", notClientTitle: "Faqat mijoz chatlari uchun",
    notClientText: "Bu murojaat mijoz hisobidan emas (masalan, advokat yoki yurist yozgan). Mijoz nomidan yordam faqat mijozlar uchun ishlaydi.",
    missingTitle: "Chat topilmadi", missingText: "Bu chat o'chirilgan yoki sizga ko'rinmaydi.", unavailableTitle: "Mijozga yordam hali ishlamaydi",
    unavailableText: "Server bu amallarni hali qo'llab-quvvatlamaydi. Keyinroq qayta urinib ko'ring.",
    errorTitle: "Mijoz ma'lumotini yuklab bo'lmadi", errorText: "Ma'lumotni yuklab bo'lmadi. Qayta urinib ko'ring.",
  },
  tabs: {
    label: "Mijoz nomidan amal", plan: "Tarif", doc: "Hujjat", market: "Xizmat", urgent: "Tezkor advokat", off: "Yopiq",
    hint: { plan: "Paket sotish", doc: "Advokat yozadi", market: "Marketplace", urgent: "Darhol aloqa" },
  },
  err: {
    priorPurchase: "Advokatlar guruhi uchun mijoz avval LexGo orqali advokat yoki yurist xizmatidan foydalangan bo'lishi kerak.",
    urgentDup: "Mijozda faol tezkor so'rov bor: {id}.", urgentDupPlain: "Mijozda faol tezkor so'rov bor.",
    planMissing: "Bu tarif topilmadi yoki sotuvda emas.", planRole: "Bu tarif mijozlar uchun ochilmagan.",
    period: "Bu muddat tanlangan tarif uchun mavjud emas.", needRequired: "Mijoz ehtiyojini yozing.",
    notApproved: "Mutaxassis hali marketplace uchun tasdiqlanmagan.", docDup: "Mijozda bu hujjat bo'yicha ochiq so'rov bor: {id}.",
    docDupPlain: "Mijozda bu hujjat bo'yicha ochiq so'rov bor.", marketDup: "Mijozda bu mutaxassis va xizmat bo'yicha faol so'rov bor: {id}.",
    marketDupPlain: "Mijozda bu mutaxassis va xizmat bo'yicha faol so'rov bor.",
  },
};
