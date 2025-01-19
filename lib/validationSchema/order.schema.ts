import { z } from "zod";
import { currencyValidation } from ".";
import { PAYMENT_METHODS } from "../constants";
import { shippingAddressSchema } from "./shippingAddress.schema";

// Order insert schema
export const insertOrderSchema = z.object({
  userId: z.string().min(1, "User is required"),
  itemsPrice: currencyValidation,
  totalPrice: currencyValidation,
  shippingPrice: currencyValidation,
  taxPrice: currencyValidation,
  paymentMethod: z.string().refine((value) => PAYMENT_METHODS.includes(value), {
    message: "Invalid payment method",
  }),
  shipingAddress: shippingAddressSchema,
});

// insert order item schema
export const insertOrderItemSchema = z.object({
  productId: z.string(),
  slug: z.string(),
  image: z.string(),
  name: z.string(),
  price: currencyValidation,
  quantity: z.number(),
});
