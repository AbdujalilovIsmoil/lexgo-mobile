import { View } from "react-native";
import { Icon } from "../Icon";
import { Input } from "../Input";
import { PressableScale } from "../PressableScale";

type Props = { value: string; onChangeText: (v: string) => void; placeholder: string; onSubmit?: () => void };

// Search field with a clear button; pair it with useDebounced for server queries.
export function SearchBox({ value, onChangeText, placeholder, onSubmit }: Props) {
  return (
    <View style={{ paddingHorizontal: 16 }}>
      <Input
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        onSubmitEditing={onSubmit}
        left={<Icon name="search" size={18} tone="gray" />}
        right={value ? <PressableScale onPress={() => onChangeText("")} hitSlop={10}><Icon name="x-circle" size={18} tone="gray" /></PressableScale> : undefined}
      />
    </View>
  );
}
