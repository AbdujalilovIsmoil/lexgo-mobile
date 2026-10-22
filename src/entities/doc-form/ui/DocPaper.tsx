import { Fragment, useMemo } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { layoutDoc, slotCount, type Block, type Seg } from "../lib/docLayout";

// The page: always a light sheet (like a printed document, in the dark theme too), ink-dark serif text, a second sheet peeking out below it for depth.
const PAPER = "#FFFFFF";
const INK = "#1B2433";
const SLOT_BG = "#FFF1C2";
const SLOT_LINE = "#E0A800";
const SLOT_INK = "#7A4E00";
const SERIF = Platform.select({ ios: "Georgia", default: "serif" });

type Props = { text: string; fade?: boolean; large?: boolean; slotTotal?: number }; // slotTotal: the spots of the whole document when `text` is only an excerpt

// A document laid out as a page (README §6 "a document-style reading surface"): the title centred, headings, numbered clauses and list items with a
// hanging indent, every line the server sent kept, and each spot still to be filled drawn as a field — a dotted-underlined, yellow label — instead of
// a bracketed word in a grey wall of text. `fade` melts the bottom of an excerpt into the page's edge.
export function DocPaper({ text, fade, large, slotTotal }: Props) {
  const { t } = useT();
  const blocks = useMemo(() => layoutDoc(text), [text]);
  const slots = slotTotal ?? slotCount(blocks);
  const size = large ? 16 : 14;
  const line = Math.round(size * 1.6);
  return (
    <View style={s.wrap}>
      {slots > 0 ? (
        <View style={s.legend}>
          <View style={s.legendSlot} />
          <Text variant="caption" tone="gray">{t("dcat.slotsN", { n: slots })}</Text>
        </View>
      ) : null}
      <View style={s.stack}>
        <View style={[s.under, { left: 10, right: 10 }]} />
        <View style={s.sheet}>
          {blocks.map((b, i) => <BlockView key={i} b={b} size={size} line={line} />)}
          {fade ? <LinearGradient pointerEvents="none" colors={["rgba(255,255,255,0)", PAPER]} style={s.fade} /> : null}
        </View>
      </View>
    </View>
  );
}

function Inline({ segs, size, line, bold, center }: { segs: Seg[]; size: number; line: number; bold?: boolean; center?: boolean }) {
  return (
    <Text selectable style={[s.text, { fontSize: size, lineHeight: line, fontFamily: SERIF, fontWeight: bold ? "700" : "400", textAlign: center ? "center" : "left" }]}>
      {segs.map((g, i) => g.slot
        ? <Text key={i} style={[s.slot, { fontSize: size - 1 }]}>{` ${g.text} `}</Text>
        : <Fragment key={i}>{g.text}</Fragment>)}
    </Text>
  );
}

function BlockView({ b, size, line }: { b: Block; size: number; line: number }) {
  switch (b.kind) {
    case "gap": return <View style={{ height: Math.round(size * 0.7) }} />;
    case "title": return <View style={s.title}><Inline segs={b.segs} size={size + 3} line={Math.round((size + 3) * 1.4)} bold center /></View>;
    case "heading": return <View style={s.heading}><Inline segs={b.segs} size={size + 1} line={Math.round((size + 1) * 1.5)} bold center={b.center} /></View>;
    case "item":
      return (
        <View style={s.item}>
          <Text style={[s.text, s.marker, { fontSize: size, lineHeight: line, fontFamily: SERIF }]}>{b.marker}</Text>
          <View style={s.flex}><Inline segs={b.segs} size={size} line={line} /></View>
        </View>
      );
    default: return <View style={s.para}><Inline segs={b.segs} size={size} line={line} /></View>;
  }
}

const s = StyleSheet.create({
  wrap: { gap: 10 },
  legend: { flexDirection: "row", alignItems: "center", gap: 8 },
  legendSlot: { width: 22, height: 10, borderRadius: 3, backgroundColor: SLOT_BG, borderBottomWidth: 2, borderBottomColor: SLOT_LINE },
  stack: { paddingBottom: 8 },
  under: { position: "absolute", bottom: 0, top: 10, backgroundColor: "rgba(255,255,255,0.55)", borderRadius: 10 },
  sheet: { backgroundColor: PAPER, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 22, overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.25, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 4 },
  text: { color: INK },
  title: { paddingBottom: 10 },
  heading: { paddingTop: 6, paddingBottom: 2 },
  para: { paddingVertical: 1 },
  item: { flexDirection: "row", gap: 8, paddingLeft: 6, paddingVertical: 1 },
  marker: { minWidth: 22, fontWeight: "600" },
  flex: { flex: 1 },
  slot: { fontFamily: SERIF, fontStyle: "italic", color: SLOT_INK, backgroundColor: SLOT_BG, textDecorationLine: "underline", textDecorationStyle: "dotted", textDecorationColor: SLOT_LINE },
  fade: { position: "absolute", left: 0, right: 0, bottom: 0, height: 70 },
});
