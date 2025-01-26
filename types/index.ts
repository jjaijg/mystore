import {
  cartItemSchema,
  insertCartSchema,
} from "@/lib/validationSchema/cart.schema";
import {
  insertOrderItemSchema,
  insertOrderSchema,
} from "@/lib/validationSchema/order.schema";
import {
  paymentMethodSchema,
  paymentResultSchema,
} from "@/lib/validationSchema/payment.schema";
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
export type PaymentResult = z.infer<typeof paymentResultSchema>;

export type OrderItem = z.infer<typeof insertOrderItemSchema>;
export type Order = z.infer<typeof insertOrderSchema> & {
  id: string;
  createdAt: Date;
  isPaid: boolean;
  paidAt: Date | null;
  isDelivered: boolean;
  deliveredAt: Date | null;
  orderItems: OrderItem[];
  user: { name: string; email: string };
};
