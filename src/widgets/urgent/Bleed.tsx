import type { ReactNode } from "react";
import { View } from "react-native";

// Full-bleed row inside a padded list: the kit's chip / search bars bring their own 16px gutter.
export const Bleed = ({ children }: { children: ReactNode }) => <View style={{ marginHorizontal: -16 }}>{children}</View>;
