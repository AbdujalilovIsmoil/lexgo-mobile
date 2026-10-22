import { Fragment, useMemo } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { circled, layoutDoc, slotCount, type Block, type Seg } from "../lib/docLayout";

// The page: always a light sheet (like a printed document, in the dark theme too), ink-dark serif text, a second sheet peeking out below it for depth.
const PAPER = "#FFFFFF";
const INK = "#1B2433";
const SOFT = "#6B7A90";
const BRAND = "#1668F0";
const FIELD_BG = "#EEF4FF";
const FIELD_INK = "#0B3D91";
const RULE = "#D5DCE7";
const SERIF = Platform.select({ ios: "Georgia", default: "serif" });

type Props = { text: string; fade?: boolean; large?: boolean; slotTotal?: number; kicker?: string }; // slotTotal: the spots of the whole document when `text` is an excerpt

// A document laid out as a formal page (README §6 "a document-style reading surface"): a letterhead line with the category, the title centred over
// a short brand-coloured rule, headings and numbered clauses with their numbers in the brand colour, justified paragraphs, list items with a hanging
// indent, every line the server sent kept. Each spot still to be filled is a numbered field — a pale blue, dotted-underlined label — and the numbers
// run in reading order. `fade` melts the bottom of an excerpt into the page's edge.
export function DocPaper({ text, fade, large, slotTotal, kicker }: Props) {
  const { t } = useT();
  const blocks = useMemo(() => layoutDoc(text), [text]);
  const slots = slotTotal ?? slotCount(blocks);
  const size = large ? 16 : 14;
  const line = Math.round(size * 1.62);
  return (
    <View style={s.wrap}>
      {slots > 0 ? (
        <View style={s.legend}>
          <View style={s.legendField}><Text style={s.legendNo}>{circled(1)}</Text></View>
          <Text variant="caption" tone="gray">{t("dcat.slotsN", { n: slots })}</Text>
        </View>
      ) : null}
      <View style={s.stack}>
        <View style={[s.under, { left: 10, right: 10 }]} />
        <View style={s.sheet}>
          <View style={s.head}>
            <Text style={s.kicker} numberOfLines={1}>{(kicker ?? "").toUpperCase()}</Text>
            <Text style={s.brand}>LEXGO</Text>
          </View>
          <View style={s.headRule} />
          {blocks.map((b, i) => <BlockView key={i} b={b} size={size} line={line} />)}
          {fade ? <LinearGradient pointerEvents="none" colors={["rgba(255,255,255,0)", PAPER]} style={s.fade} /> : null}
        </View>
      </View>
    </View>
  );
}

function Inline({ segs, size, line, bold, align }: { segs: Seg[]; size: number; line: number; bold?: boolean; align?: "left" | "center" | "justify" }) {
  // A long field label opens ugly gaps in a justified line: only lines without a spot are justified.
  const a = align === "justify" && segs.some((g) => g.slot) ? "left" : align;
  return (
    <Text selectable style={[s.text, { fontSize: size, lineHeight: line, fontFamily: SERIF, fontWeight: bold ? "700" : "400", textAlign: a ?? "left" }]}>
      {segs.map((g, i) => g.slot
        ? <Text key={i} style={[s.field, { fontSize: size - 2 }]}>{` ${circled(g.n ?? 0)} ${g.text} `}</Text>
        : <Fragment key={i}>{g.text}</Fragment>)}
    </Text>
  );
}

// A heading that starts with its number ("1. Umumiy qoidalar"): the number in the brand colour, the words in ink.
function Numbered({ segs, size, line }: { segs: Seg[]; size: number; line: number }) {
  const first = segs[0];
  const m = first && !first.slot ? /^(\d+(?:\.\d+)*[.)]?)\s+([\s\S]*)$/.exec(first.text) : null;
  if (!m) return <Inline segs={segs} size={size} line={line} bold />;
  return (
    <Text selectable style={[s.text, { fontSize: size, lineHeight: line, fontFamily: SERIF, fontWeight: "700" }]}>
      <Text style={{ color: BRAND }}>{m[1]}  </Text>
      {m[2]}
      {segs.slice(1).map((g, i) => (g.slot ? <Text key={i} style={[s.field, { fontSize: size - 2 }]}>{` ${circled(g.n ?? 0)} ${g.text} `}</Text> : <Fragment key={i}>{g.text}</Fragment>))}
    </Text>
  );
}

function BlockView({ b, size, line }: { b: Block; size: number; line: number }) {
  switch (b.kind) {
    case "gap": return <View style={{ height: Math.round(size * 0.65) }} />;
    case "title":
      return (
        <View style={s.title}>
          <Inline segs={b.segs} size={size + 3} line={Math.round((size + 3) * 1.4)} bold align="center" />
          <View style={s.ornament} />
        </View>
      );
    case "heading":
      return (
        <View style={s.heading}>
          {b.center ? <Inline segs={b.segs} size={size} line={Math.round(size * 1.5)} bold align="center" /> : <Numbered segs={b.segs} size={size + 1} line={Math.round((size + 1) * 1.5)} />}
        </View>
      );
    case "item":
      return (
        <View style={s.item}>
          <Text style={[s.marker, { fontSize: size, lineHeight: line, fontFamily: SERIF }]}>{b.marker}</Text>
          <View style={s.flex}><Inline segs={b.segs} size={size} line={line} align="justify" /></View>
        </View>
      );
    default: return <View style={s.para}><Inline segs={b.segs} size={size} line={line} align="justify" /></View>;
  }
}

const s = StyleSheet.create({
  wrap: { gap: 10 },
  legend: { flexDirection: "row", alignItems: "center", gap: 8 },
  legendField: { height: 18, minWidth: 26, borderRadius: 6, backgroundColor: FIELD_BG, borderBottomWidth: 2, borderBottomColor: BRAND, alignItems: "center", justifyContent: "center", paddingHorizontal: 5 },
  legendNo: { fontSize: 11, color: FIELD_INK, fontWeight: "700" },
  stack: { paddingBottom: 8 },
  under: { position: "absolute", bottom: 0, top: 10, backgroundColor: "rgba(255,255,255,0.55)", borderRadius: 10 },
  sheet: { backgroundColor: PAPER, borderRadius: 10, paddingHorizontal: 22, paddingTop: 14, paddingBottom: 24, overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.25, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 4 },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  kicker: { flex: 1, fontSize: 9.5, letterSpacing: 1.4, color: SOFT, fontWeight: "600" },
  brand: { fontSize: 9.5, letterSpacing: 2, color: BRAND, fontWeight: "800" },
  headRule: { height: 1, backgroundColor: RULE, marginTop: 8, marginBottom: 18 },
  text: { color: INK },
  title: { paddingBottom: 14, alignItems: "stretch" },
  ornament: { alignSelf: "center", width: 44, height: 3, borderRadius: 2, backgroundColor: BRAND, marginTop: 12 },
  heading: { paddingTop: 10, paddingBottom: 3 },
  para: { paddingVertical: 2 },
  item: { flexDirection: "row", gap: 8, paddingLeft: 4, paddingVertical: 2 },
  marker: { minWidth: 24, color: BRAND, fontWeight: "700" },
  flex: { flex: 1 },
  field: { fontFamily: SERIF, color: FIELD_INK, backgroundColor: FIELD_BG, textDecorationLine: "underline", textDecorationStyle: "dotted", textDecorationColor: BRAND, fontWeight: "400" },
  fade: { position: "absolute", left: 0, right: 0, bottom: 0, height: 80 },
});
