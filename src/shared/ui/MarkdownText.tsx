import { Fragment } from "react";
import { Linking, Text as RNText } from "react-native";
import { Text } from "./Text";

const INLINE = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
const LINK = /^\[([^\]]+)\]\(([^)]+)\)$/;

type Props = { text: string; color: string; linkColor: string; mutedColor: string };

// Minimal markdown for assistant replies: **bold**, [links](url), headings,
// bullets and "> quotes". Everything else is plain text.
export function MarkdownText({ text, color, linkColor, mutedColor }: Props) {
  const lines = text.split("\n");
  return (
    <Text variant="body" style={{ color }}>
      {lines.map((raw, i) => {
        const quote = /^\s*>\s?/.test(raw);
        const head = /^\s*#{1,4}\s+/.test(raw);
        const line = raw.replace(/^\s*>\s?/, "").replace(/^\s*#{1,4}\s+/, "").replace(/^\s*[-*]\s+/, "• ");
        return (
          <Fragment key={i}>
            {line.split(INLINE).filter(Boolean).map((part, j) => {
              const link = part.match(LINK);
              if (link) {
                return (
                  <RNText key={j} onPress={() => void Linking.openURL(link[2]).catch(() => {})} style={{ color: linkColor, textDecorationLine: "underline" }}>
                    {link[1]}
                  </RNText>
                );
              }
              if (part.startsWith("**") && part.endsWith("**")) {
                return (
                  <RNText key={j} style={{ fontFamily: "Inter_700Bold" }}>
                    {part.slice(2, -2)}
                  </RNText>
                );
              }
              return (
                <RNText key={j} style={[quote && { color: mutedColor }, head && { fontFamily: "Inter_700Bold" }]}>
                  {part}
                </RNText>
              );
            })}
            {i < lines.length - 1 ? "\n" : ""}
          </Fragment>
        );
      })}
    </Text>
  );
}
