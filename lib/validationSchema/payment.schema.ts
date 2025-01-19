import { z } from "zod";
import { PAYMENT_METHODS } from "../constants";

// Payment methos schema
export const paymentMethodSchema = z
  .object({
    type: z.string().min(1, "Payment method is required"),
  })
  .refine(
    (data) => {
      console.log(data.type, PAYMENT_METHODS);
      return true;
      // PAYMENT_METHODS.includes(data.type);
    },
    {
      path: ["type"],
      message: "Invalid payment method",
    }
  );
