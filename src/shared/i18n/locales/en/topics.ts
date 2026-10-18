import type { Messages } from "../uz";

export const topics: Messages["topics"] = {
  title: "What's the issue?",
  sub: "Pick a topic — we'll show matching services and lawyers",
  services: "Matching services",
  lawyers: "Matching lawyers",
  askAi: "Ask AI",
  findLawyer: "Choose a lawyer",
  none: "No matching services",
  aiPrompt: "I need advice about {topic}",
  items: {"family": {"title": "Family", "desc": "Marriage, divorce, alimony, guardianship"}, "labor": {"title": "Employment", "desc": "Pay, dismissal, disputes"}, "realEstate": {"title": "Real estate", "desc": "Sale, lease, inheritance"}, "criminal": {"title": "Criminal", "desc": "Investigation, court, defense"}, "tax": {"title": "Tax", "desc": "Tax disputes and advice"}, "business": {"title": "Business", "desc": "LLC, contracts, legal support"}},
};
