import { useEffect, useState } from "react";
import type { ImageSourcePropType } from "react-native";
import { Feather } from "@expo/vector-icons";

type Images = Record<string, ImageSourcePropType>;
let cache: Images | null = null;

// The bar's Feather glyphs drawn to images once (getImageSource is async), so the system bar shows the very icons of the design and of
// the Android bar; the system tints them (template images). Until they are ready the bar uses SF Symbols.
export function useBarImages(names: string[]): Images | null {
  const [images, setImages] = useState<Images | null>(cache);
  const key = names.join(",");
  useEffect(() => {
    if (cache && key.split(",").every((n) => cache?.[n])) return;
    let live = true;
    void Promise.all(key.split(",").map(async (n) => [n, await Feather.getImageSource(n as never, 25, "#000000")] as const))
      .then((pairs) => {
        cache = { ...cache, ...Object.fromEntries(pairs.filter(([, src]) => src)) } as Images;
        if (live) setImages(cache);
      })
      .catch(() => {});
    return () => { live = false; };
  }, [key]);
  return images;
}
