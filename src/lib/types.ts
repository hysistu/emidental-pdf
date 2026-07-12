export type Gender = "M" | "F" | "";

export type MaterialKey =
  | "zirkonPorcelan"
  | "fullZirkonMulti"
  | "fullZirkonOne"
  | "lithiumFullStains"
  | "lithiumPorcelan"
  | "metalPro"
  | "metalBazik"
  | "kuroraUra"
  | "feldspathic"
  | "inlayOnlay"
  | "implant"
  | "pmma"
  | "waxUp"
  | "komposit";

export interface OrderFormData {
  doctorName: string;
  patientName: string;
  patientCardNo: string;
  gender: Gender;
  age: string;
  acceptanceDate: string;
  deliveryDate: string;
  selectedTeeth: number[];
  /** Each bridge is a group of 2+ tooth numbers connected as an urë */
  bridges: number[][];
  materials: MaterialKey[];
  toothColor: string;
  stumpShade: string;
  characterizations: string;
  contactEmail: string;
  contactPhone: string;
  /** Set when a retracted photo is attached (file itself is not stored here) */
  hasRetractedImage: boolean;
  /** Set when a smile photo is attached */
  hasSmileImage: boolean;
}

export const EMPTY_ORDER: OrderFormData = {
  doctorName: "",
  patientName: "",
  patientCardNo: "",
  gender: "",
  age: "",
  acceptanceDate: "",
  deliveryDate: "",
  selectedTeeth: [],
  bridges: [],
  materials: [],
  toothColor: "",
  stumpShade: "",
  characterizations: "",
  contactEmail: "",
  contactPhone: "",
  hasRetractedImage: false,
  hasSmileImage: false,
};
