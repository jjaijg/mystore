import {
  cartItemSchema,
  insertCartSchema,
} from "@/lib/validationSchema/cart.schema";
import { paymentMethodSchema } from "@/lib/validationSchema/payment.schema";
import { insertProductSchema } from "@/lib/validationSchema/product.schema";
import { shippingAddressSchema } from "@/lib/validationSchema/shippingAddress.schema";

import { z } from "zod";

export type Product = z.infer<typeof insertProductSchema> & {
  id: string;
  rating: string;
  createdAt: Date;
};

export type Cart = z.infer<typeof insertCartSchema>;
export type CartItem = z.infer<typeof cartItemSchema>;

export type ShippingAddress = z.infer<typeof shippingAddressSchema>;

export type PaymentMethod = z.infer<typeof paymentMethodSchema>;
