import { z } from "zod";
import { PAYMENT_METHODS } from "../constants";

// Payment method schema
export const paymentMethodSchema = z
  .object({
    type: z.string().min(1, "Payment method is required"),
  })
  .refine(
    (data) => {
      return PAYMENT_METHODS.includes(data.type);
    },
    {
      path: ["type"],
      message: "Invalid payment method",
    }
  );

// payment result schema
export const paymentResultSchema = z.object({
  id: z.string(),
  status: z.string(),
  email_address: z.string(),
  pricePaid: z.string(),
});
