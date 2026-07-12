import type { MaterialKey } from "./types";

export const LAB = {
  name: "EMI DENTAL LAB.",
  tagline: "Laboratoriumi i teknikës dentare",
  email: "emidentalcenter.lab@gmail.com",
  phone: "(383) 48 507-133",
  address: "Rr. Agron Rrahamani pn | Podujeve, 11000",
  legal: "EMI DENTAL LAB SH.P.K.",
} as const;

/** Common Vita shades — one tap to fill tooth color */
export const SHADE_PRESETS = [
  "A1",
  "A2",
  "A3",
  "A3.5",
  "B1",
  "B2",
  "BL1",
  "BL2",
  "BL3",
  "C1",
  "C2",
  "D2",
] as const;

export const UPPER_TEETH = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28] as const;
export const LOWER_TEETH = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38] as const;

export const MATERIAL_OPTIONS: {
  group: string;
  items: { key: MaterialKey; label: string; hint?: string }[];
}[] = [
  {
    group: "Zirkon, LD & Porcelan",
    items: [
      { key: "zirkonPorcelan", label: "Zirkon & Porcelan", hint: "Shtresim Pro" },
      { key: "fullZirkonMulti", label: "Full Zirkon Multi Layer", hint: "(max 3 dhëmbë urë)" },
      { key: "fullZirkonOne", label: "Full Zirkon One Layer", hint: "(nuk rekomandohet për anterior)" },
      { key: "lithiumFullStains", label: "Lithium Disilikate full & Stains" },
      { key: "lithiumPorcelan", label: "Lithium Disilikate & Porcelan" },
    ],
  },
  {
    group: "Metal Porcelan",
    items: [
      { key: "metalPro", label: "Pro*" },
      { key: "metalBazik", label: "Bazik" },
    ],
  },
  {
    group: "Restaurimi",
    items: [
      { key: "kuroraUra", label: "Kurora Ura" },
      { key: "feldspathic", label: "Feldspathic veneers" },
      { key: "inlayOnlay", label: "Inlay/Onlay ZirCAD" },
      { key: "implant", label: "Implant" },
    ],
  },
  {
    group: "Të tjera",
    items: [
      { key: "pmma", label: "PMMA" },
      { key: "waxUp", label: "WaxUp" },
      { key: "komposit", label: "Komposit" },
    ],
  },
];

export const MATERIAL_LABELS: Record<MaterialKey, string> = Object.fromEntries(
  MATERIAL_OPTIONS.flatMap((g) => g.items.map((i) => [i.key, i.label])),
) as Record<MaterialKey, string>;
