import { StyleSheet, View } from "react-native";
import { Icon } from "@/shared/ui";

type Props = { color: string; paper: string; file: boolean };

const W = 40;
const H = 50;
const FOLD = 12;

// A sheet of paper in the category's colour: the top-right corner folded over, a few lines of text and, when the template has its DOCX,
// a small clip. Drawn with plain views (no image), so it takes both themes and any colour.
export function PaperTile({ color, paper, file }: Props) {
  return (
    <View style={[s.sheet, { backgroundColor: paper, borderColor: color }]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View style={[s.fold, { borderTopColor: paper, borderLeftColor: color }]} />
      <View style={s.lines}>
        <View style={[s.line, { backgroundColor: color, width: 18 }]} />
        <View style={[s.line, { backgroundColor: color, opacity: 0.55, width: 22 }]} />
        <View style={[s.line, { backgroundColor: color, opacity: 0.55, width: 22 }]} />
        <View style={[s.line, { backgroundColor: color, opacity: 0.35, width: 13 }]} />
      </View>
      {file ? <View style={[s.clip, { backgroundColor: color }]}><Icon name="paperclip" size={9} tone="white" /></View> : null}
    </View>
  );
}

const s = StyleSheet.create({
  sheet: { width: W, height: H, borderRadius: 8, borderWidth: 1.5, overflow: "hidden", justifyContent: "flex-end", paddingBottom: 8, paddingLeft: 6 },
  // the dog-ear: a triangle with its right angle at the bottom-left of a FOLD square in the corner (colour below the diagonal, paper above it)
  fold: { position: "absolute", top: 0, right: 0, width: 0, height: 0, borderTopWidth: FOLD, borderLeftWidth: FOLD, borderRightWidth: 0, borderBottomWidth: 0 },
  lines: { gap: 4 },
  line: { height: 3, borderRadius: 2 },
  clip: { position: "absolute", right: 5, bottom: 5, width: 14, height: 14, borderRadius: 7, alignItems: "center", justifyContent: "center" },
});
