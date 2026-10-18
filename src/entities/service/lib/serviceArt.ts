import type { ImageSourcePropType } from "react-native";

// The web's illustrations of the catalogue (law-main/public/img), 360 px wide.
export const ART = {
  "fuqaro": require("../../../../assets/services/fuqaro.png") as ImageSourcePropType,
  "iqtisodiy": require("../../../../assets/services/iqtisodiy.png") as ImageSourcePropType,
  "jinoiy": require("../../../../assets/services/jinoiy.png") as ImageSourcePropType,
  "mamuriy": require("../../../../assets/services/mamuriy.png") as ImageSourcePropType,
  "mehnat-nizolari": require("../../../../assets/services/mehnat-nizolari.png") as ImageSourcePropType,
  "oliaviy-meros": require("../../../../assets/services/oliaviy-meros.png") as ImageSourcePropType,
  "bankrotlik": require("../../../../assets/services/bankrotlik.png") as ImageSourcePropType,
  "tergov-chorasi": require("../../../../assets/services/tergov-chorasi.png") as ImageSourcePropType,
  "prokuror-jinoyat": require("../../../../assets/services/prokuror-jinoyat.png") as ImageSourcePropType,
  "transport-logistika": require("../../../../assets/services/transport-logistika.png") as ImageSourcePropType,
  "ishonchnoma": require("../../../../assets/services/ishonchnoma.png") as ImageSourcePropType,
  "ijro": require("../../../../assets/services/ijro.png") as ImageSourcePropType,
  "qarzdorlik": require("../../../../assets/services/qarzdorlik.png") as ImageSourcePropType,
  "mamuriy-jarima": require("../../../../assets/services/mamuriy-jarima.png") as ImageSourcePropType,
  "davlat-orgnalari": require("../../../../assets/services/davlat-orgnalari.png") as ImageSourcePropType,
  "kredit": require("../../../../assets/services/kredit.png") as ImageSourcePropType,
  "royhatga-olish": require("../../../../assets/services/royhatga-olish.png") as ImageSourcePropType,
  "korporativ": require("../../../../assets/services/korporativ.png") as ImageSourcePropType,
  "boshqa-fuqorolik": require("../../../../assets/services/boshqa-fuqorolik.png") as ImageSourcePropType,
  "uyjoy-nizolari": require("../../../../assets/services/uyjoy-nizolari.png") as ImageSourcePropType,
  "yetkazib-berish": require("../../../../assets/services/yetkazib-berish.png") as ImageSourcePropType,
  "shartnomlar": require("../../../../assets/services/shartnomlar.png") as ImageSourcePropType,
  "sudarizalari": require("../../../../assets/services/sudarizalari.png") as ImageSourcePropType,
};
export type ArtKey = keyof typeof ART;
