import { Text as RNText, type TextStyle } from "react-native";
import { openUrl } from "@/shared/lib/links";

const TOKEN = /(\*\*[^*]+\*\*|__[^_]+__|`[^`]+`|\[[^\]]+\]\([^)]+\)|(?<!\w)_(?!\s)[^_\n]*[^_\s]_(?!\w)|(?<![\w*])\*(?!\s)[^*\n]*[^*\s]\*(?![\w*]))/g;
const LINK = /^\[([^\]]+)\]\(([^)]+)\)$/;
const SAFE = /^(https?:\/\/|mailto:|tel:)/i;

type Props = { text: string; linkColor: string; codeBg: string };

function styled(part: string, codeBg: string): { body: string; style?: TextStyle } {
  if (/^(\*\*|__)[^]+\1$/.test(part)) return { body: part.slice(2, -2), style: { fontFamily: "Inter_700Bold" } };
  if (/^`[^`]+`$/.test(part)) return { body: part.slice(1, -1), style: { backgroundColor: codeBg } };
  if (/^([_*])[^]+\1$/.test(part)) return { body: part.slice(1, -1), style: { fontStyle: "italic" } };
  return { body: part };
}

// **bold**, _italic_, `code` and [links](https://…) — only http(s)/mailto/tel links open.
export function Inline({ text, linkColor, codeBg }: Props) {
  return (
    <>
      {text.split(TOKEN).filter(Boolean).map((part, i) => {
        const link = part.match(LINK);
        if (link) {
          const url = link[2].trim();
          const ok = SAFE.test(url);
          return (
            <RNText key={i} onPress={ok ? () => openUrl(url) : undefined} style={ok ? { color: linkColor, textDecorationLine: "underline" } : undefined}>
              {link[1]}
            </RNText>
          );
        }
        const { body, style } = styled(part, codeBg);
        return (
          <RNText key={i} style={style}>
            {body}
          </RNText>
        );
      })}
    </>
  );
}
