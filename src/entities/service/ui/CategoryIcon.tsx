import { View } from "react-native";
import {
  BadgeCheck,
  Briefcase,
  Circle,
  ClipboardList,
  Copyright,
  FilePenLine,
  FileSignature,
  FileText,
  Gavel,
  HandCoins,
  HardHat,
  House,
  Landmark,
  Plane,
  ReceiptText,
  Rocket,
  ScrollText,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react-native";

type GlyphProps = { size?: number; color?: string };

const RING = 0.68; // one ring's share of the icon's width; the two overlap in the middle

// Wedding rings: Lucide has no ring icon, so two of its circles interlock. The stroke is scaled back up to match the other icons.
function Rings({ size = 24, color }: GlyphProps) {
  const ring = size * RING;
  return (
    <View style={{ width: size, height: size }}>
      <Circle size={ring} color={color} strokeWidth={2 / RING} style={{ position: "absolute", left: 0, top: (size - ring) / 2 }} />
      <Circle size={ring} color={color} strokeWidth={2 / RING} style={{ position: "absolute", right: 0, top: (size - ring) / 2 }} />
    </View>
  );
}

// One icon per category of GET /marketplace/service-category-tree, by the backend's slug.
const ICONS: Readonly<Record<string, LucideIcon | typeof Rings>> = {
  "legal-doc-criminal": ShieldAlert,
  "legal-doc-criminal-advokat-bilan-ariza": FilePenLine,
  "legal-doc-administrative": ClipboardList,
  "legal-doc-administrative-ma-muriy-huquqbuzarlik": TriangleAlert,
  "oila-va-nikoh": Rings,
  "uy-joy-va-kochmas-mulk": House,
  "qarz-pul-va-undirish": HandCoins,
  "sud-va-nizolar": Gavel,
  "jinoyat-ishlari": ShieldAlert,
  "mamuriy-ishlar": ClipboardList,
  "mehnat-qonunchiligi": HardHat,
  "biznes-ochish-va-kompaniya": Rocket,
  shartnomalar: FileSignature,
  "soliq-va-bojxona": ReceiptText,
  "hujjat-va-arizalar": FileText,
  "davlat-organlari-bilan-nizolar": Landmark,
  meros: ScrollText,
  "zarar-va-istemolchi-huquqlari": BadgeCheck,
  "tadbirkorlik-va-biznes-himoyasi": ShieldCheck,
  "brend-intellektual-mulk-va-internet": Copyright,
  "xorij-viza-va-migratsiya": Plane,
  "iqtisod-biznes-va-qardorilika-oid-ishlar": TrendingUp,
};

// The most specific slug that has an icon wins: a child category without its own takes its parent's.
export const hasCategoryIcon = (slugs: readonly string[]): boolean => slugs.some((x) => x in ICONS);

type Props = GlyphProps & { slugs: readonly string[] }; // the category's slugs, from the root down to itself

// A service category's icon, drawn from its slugs. A category without one (an admin's new one) gets the briefcase.
export function CategoryIcon({ slugs, size, color }: Props) {
  const slug = [...slugs].reverse().find((x) => x in ICONS);
  const Glyph = slug ? ICONS[slug] : Briefcase;
  return <Glyph size={size} color={color} />;
}
