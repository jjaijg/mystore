import { z } from "zod";
import { formatNumberWithDecimal } from "../utils";

export const currencyValidation = z.string().refine((value) => {
  return /^\d+(\.\d{2})?$/.test(formatNumberWithDecimal(Number(value)));
}, "Price must have exactly two decimal places");
