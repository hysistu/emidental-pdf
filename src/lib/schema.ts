import { z } from "zod";

const materialKeys = [
  "zirkonPorcelan",
  "fullZirkonMulti",
  "fullZirkonOne",
  "lithiumFullStains",
  "lithiumPorcelan",
  "metalPro",
  "metalBazik",
  "kuroraUra",
  "feldspathic",
  "inlayOnlay",
  "implant",
  "pmma",
  "waxUp",
  "komposit",
] as const;

const optionalEmail = z
  .string()
  .trim()
  .optional()
  .default("")
  .refine((v) => !v || z.string().email().safeParse(v).success, {
    message: "Email i pavlefshëm",
  });

export const orderSchema = z.object({
  doctorName: z.string().trim().min(2, "Shkruani emrin e doktorit"),
  patientName: z.string().trim().min(2, "Shkruani emrin e pacientit"),
  patientCardNo: z.string().optional().default(""),
  gender: z.enum(["M", "F", ""]),
  age: z.string().optional().default(""),
  acceptanceDate: z.string().min(1, "Zgjidhni datën e pranimit"),
  deliveryDate: z.string().optional().default(""),
  selectedTeeth: z.array(z.number()).min(1, "Zgjidhni të paktën një dhëmb"),
  bridges: z.array(z.array(z.number())).default([]),
  materials: z.array(z.enum(materialKeys)).default([]),
  toothColor: z.string().optional().default(""),
  stumpShade: z.string().optional().default(""),
  characterizations: z.string().optional().default(""),
  contactEmail: optionalEmail,
  contactPhone: z.string().optional().default(""),
  hasRetractedImage: z.boolean().optional().default(false),
  hasSmileImage: z.boolean().optional().default(false),
  hasUpperJawScan: z.boolean().optional().default(false),
  hasLowerJawScan: z.boolean().optional().default(false),
  hasBiteScan: z.boolean().optional().default(false),
  hasBiteScan2: z.boolean().optional().default(false),
});

export type OrderPayload = z.infer<typeof orderSchema>;
