export type AdjustmentType = "fixed" | "percent";

// One optional, price-increasing choice (GET …/price-options). Option ids are unique inside one form.
export type PriceOption = { id: string; label: string; description: string; type: AdjustmentType; value: number };
export type OptionSection = { id: string; title: string; description: string; options: PriceOption[] };
export type PriceOptions = { targetType: "service" | "package"; targetId: string; basePrice: number; currency: string; sections: OptionSection[] };

// One line of the quote's explanation: an option and the amount it added.
export type QuoteLine = { id: string; label: string; sectionTitle: string; type: AdjustmentType; value: number; amount: number };

// POST …/quote → `quote`. `totalPrice` is the only authoritative total; nothing is calculated on the phone.
export type Quote = { basePrice: number; additional: number; totalPrice: number; currency: string; selectedIds: string[]; lines: QuoteLine[] };
