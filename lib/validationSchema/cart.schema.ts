// Cart schemas

import { z } from "zod";
import { currencyValidation } from ".";

export const cartItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  name: z.string().min(1, "Product name is required"),
  slug: z.string().min(1, "Slug is required"),
  quantity: z.number().int().nonnegative("Quantity must be greater than 0"),
  image: z.string().min(1, "Product image is required"),
  price: currencyValidation,
});

export const insertCartSchema = z.object({
  items: z.array(cartItemSchema),
  itemsPrice: currencyValidation,
  totalPrice: currencyValidation,
  shippingPrice: currencyValidation,
  taxPrice: currencyValidation,
  sessionCartId: z.string().min(1, "Session cart id is required"),
  userId: z.string().optional().nullable(),
});
