import {
  cartItemSchema,
  insertCartSchema,
} from "@/lib/validationSchema/cart.schema";
import { insertProductSchema } from "@/lib/validationSchema/product.schema";

import { z } from "zod";

export type Product = z.infer<typeof insertProductSchema> & {
  id: string;
  rating: string;
  createdAt: Date;
};

export type Cart = z.infer<typeof insertCartSchema>;
export type CartItem = z.infer<typeof cartItemSchema>;
