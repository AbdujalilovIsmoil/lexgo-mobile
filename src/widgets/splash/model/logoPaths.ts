// The LexGo mark redrawn as vectors in a 1254 × 1254 box (public/logo.png).
// Three shapes: the silver "L", the blue "C" body of the G, and the G's
// lower arm (a lit block plus a dark triangle).
export const LOGO_SIZE = 1254;

export type LogoShape = {
  key: string;
  d: string;
  colors: string[];
  positions?: number[];
  from: [number, number];
  to: [number, number];
};

export const SHAPES: LogoShape[] = [
  {
    key: "l",
    d: "M368 140 C368 128 355 124 345 131 L150 262 C125 280 112 300 112 335 L112 960 C112 1050 160 1090 245 1090 L560 1090 Q600 1090 630 1068 L832 880 Q840 872 828 872 L372 872 Q368 872 368 866 Z",
    colors: ["#FFFFFF", "#F2F6FF", "#9DB8EC"],
    positions: [0, 0.5, 1],
    from: [400, 200],
    to: [150, 1000],
  },
  {
    key: "c",
    d: "M372 872 L372 560 C372 400 520 298 700 297 L905 297 Q935 297 955 318 L1138 482 Q1150 495 1133 497 L762 500 C655 512 570 590 570 705 C570 800 640 866 742 868 Z",
    colors: ["#0A2FA8", "#1055E0", "#2D9BFF", "#5FE6FF"],
    positions: [0, 0.35, 0.7, 1],
    from: [372, 880],
    to: [1100, 300],
  },
  {
    key: "arm",
    d: "M722 762 L880 645 Q900 628 930 628 L1135 628 Q1180 632 1178 690 L1172 880 Q1168 1000 1095 1062 Q1075 1090 1035 1090 L992 1090 L992 770 Z",
    colors: ["#1E8FFF", "#2FC4FF", "#58E8FF"],
    from: [722, 800],
    to: [1170, 640],
  },
  {
    key: "tri",
    d: "M990 770 L992 1090 L630 1088 Z",
    colors: ["#0A2E9E", "#1055D8"],
    from: [630, 1088],
    to: [992, 780],
  },
];
