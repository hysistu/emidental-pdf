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
  materials: MaterialKey[];
  toothColor: string;
  stumpShade: string;
  characterizations: string;
  contactEmail: string;
  contactPhone: string;
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
  materials: [],
  toothColor: "",
  stumpShade: "",
  characterizations: "",
  contactEmail: "",
  contactPhone: "",
};
