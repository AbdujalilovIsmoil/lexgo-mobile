// Catalogue values arrive as keys ("yurist_advokat", "online", "standard") or, for rows imported from
// the Excel catalogue, in Cyrillic ("Юрист", "Онлайн"); either maps to one translated label.
const KEYS: Record<string, string> = {
  yurist: "lawyer", lawyer: "lawyer", "юрист": "lawyer",
  advokat: "advocate", advocate: "advocate", "адвокат": "advocate",
  yurist_advokat: "any", lawyer_advocate: "any", any: "any", "юрист/адвокат": "any", "юрист ёки адвокат": "any", "юрист/advokat": "any",
  online: "online", "онлайн": "online", offline: "offline", "офлайн": "offline", hybrid: "hybrid", "аралаш": "hybrid", "онлайн/офлайн": "hybrid",
  basic: "basic", "базавий": "basic", standard: "standard", "стандарт": "standard", premium: "premium", "премиум": "premium",
};

export const valueKey = (raw?: string): string => KEYS[(raw ?? "").trim().toLowerCase()] ?? "";
