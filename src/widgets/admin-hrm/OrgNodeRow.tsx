import { memo } from "react";
import { View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import type { OrgRow } from "./orgRows";
import { INDENT, OrgGuides } from "./OrgGuides";
import { OrgPersonRow } from "./OrgPersonRow";
import { OrgUnitRow } from "./OrgUnitRow";

type Props = { row: OrgRow; onToggle: () => void; onPress: () => void; index?: number };

// One line of the org tree, indented by depth with guide lines: a unit ticket (headcount, expand toggle) or a light person row.
export const OrgNodeRow = memo(function OrgNodeRow({ row, onToggle, onPress, index = 0 }: Props) {
  const n = row.node;
  return (
    <Animated.View entering={FadeInUp.delay(Math.min(index, 8) * 30).duration(240)}>
      <View style={{ paddingLeft: row.depth * INDENT }}>
        <OrgGuides depth={row.depth} />
        {n.kind === "unit" ? <OrgUnitRow node={n} open={row.open} kids={row.kids} onToggle={onToggle} onPress={onPress} /> : <OrgPersonRow node={n} />}
      </View>
    </Animated.View>
  );
});
