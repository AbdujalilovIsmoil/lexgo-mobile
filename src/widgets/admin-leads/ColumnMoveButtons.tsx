import { View } from "react-native";
import { IconButton } from "@/shared/ui";
import { useT } from "@/shared/i18n";

type Props = { first: boolean; last: boolean; busy: boolean; onMove: (dir: -1 | 1) => void };

// Up / down arrows of one status row; an arrow that cannot move is dimmed and inert.
export function ColumnMoveButtons({ first, last, busy, onMove }: Props) {
  const { t } = useT();
  const off = (on: boolean) => ({ opacity: on ? 0.3 : 1 });
  return (
    <>
      <View style={off(first || busy)} pointerEvents={first || busy ? "none" : "auto"}>
        <IconButton icon="arrow-up" size={34} label={t("cc5.moveUp")} onPress={() => onMove(-1)} />
      </View>
      <View style={off(last || busy)} pointerEvents={last || busy ? "none" : "auto"}>
        <IconButton icon="arrow-down" size={34} label={t("cc5.moveDown")} onPress={() => onMove(1)} />
      </View>
    </>
  );
}
