import type { ImageSourcePropType } from "react-native";

// The studio's pictures, the same ones the web home draws (/img/*.png there, assets/studio here, 288 px).
export const KPI_ART: Record<"total" | "published" | "draft" | "submitted" | "approved", ImageSourcePropType> = {
  total: require("../../../../assets/studio/yozuvlar.png") as number,
  published: require("../../../../assets/studio/yuborildi.png") as number,
  draft: require("../../../../assets/studio/qoralama.png") as number,
  submitted: require("../../../../assets/studio/tekshiruvda.png") as number,
  approved: require("../../../../assets/studio/elon-kutilmoqda.png") as number,
};

// One picture per backend group; advertising has none on the web, so it keeps its icon.
const GROUP_ART: Record<string, ImageSourcePropType> = {
  services_packages: require("../../../../assets/studio/xizmatlar-paketlar.png") as number,
  documents_texts: require("../../../../assets/studio/hujatlar-matnlar.png") as number,
  process_quality: require("../../../../assets/studio/jarayon-sifat.png") as number,
  communications: require("../../../../assets/studio/muloqot.png") as number,
  finance_tariffs: require("../../../../assets/studio/moliya-tariflar.png") as number,
  security_access: require("../../../../assets/studio/xavfsizlik-kirish.png") as number,
  operations: require("../../../../assets/studio/operatsiyalar.png") as number,
  integrations: require("../../../../assets/studio/integratsiyalar.png") as number,
  system_reference: require("../../../../assets/studio/tizim-malumotlar.png") as number,
};
export const groupArt = (key: string): ImageSourcePropType | null => GROUP_ART[key] ?? null;
