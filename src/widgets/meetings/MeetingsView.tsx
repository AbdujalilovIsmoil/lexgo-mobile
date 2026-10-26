import { View } from "react-native";
import { MeetingsBoard } from "./MeetingsBoard";

// Meetings screen body: my meetings. `bottom` keeps the last row clear of a tab bar.
export function MeetingsView({ bottom }: { bottom: number }) {
  return (
    <View style={{ flex: 1 }}>
      <MeetingsBoard bottom={bottom} />
    </View>
  );
}
