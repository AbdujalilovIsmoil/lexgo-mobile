import type { IconName } from "@/shared/ui";

export type Topic = { key: string; icon: IconName; colors: [string, string]; query: string; area: string };

// Life situations people actually come with. `query` feeds the service search,
// `area` is the practice-area filter used for the matching lawyers.
export const TOPICS: Topic[] = [
  { key: "family", icon: "heart", colors: ["#E0457F", "#FF8DB8"], query: "nikoh", area: "family" },
  { key: "labor", icon: "briefcase", colors: ["#1668F0", "#5CA8FF"], query: "mehnat", area: "labor" },
  { key: "realEstate", icon: "home", colors: ["#00A870", "#3DDC97"], query: "mulk", area: "realEstate" },
  { key: "criminal", icon: "shield", colors: ["#D92D20", "#FF8A80"], query: "jinoyat", area: "criminal" },
  { key: "tax", icon: "percent", colors: ["#C2680A", "#FBC15E"], query: "soliq", area: "tax" },
  { key: "business", icon: "trending-up", colors: ["#7A5CFF", "#B7A4FF"], query: "biznes", area: "economic" },
];
