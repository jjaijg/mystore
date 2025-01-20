"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { formatError } from "../utils";
import { auth } from "@/auth";
import { getMyCart } from "./cart.action";
import { getUserById } from "./user.actions";
import { insertOrderSchema } from "../validationSchema/order.schema";
import { prisma } from "@/db/prisma";

// create order & order items

export async function createOrder() {
  try {
    const session = await auth();
    if (!session) throw new Error("User id not authenticated");

    const userId = session.user.id;

    if (!userId) throw new Error("User not found");

    const user = await getUserById(userId);
    const cart = await getMyCart();

    if (!cart || cart.items.length === 0)
      return {
        success: false,
        message: "Your cart is empty",
        redirectTo: "/cart",
      };
    if (!user.address)
      return {
        success: false,
        message: "Shipping address not found",
        redirectTo: "/shipping-address",
      };
    if (!user.paymentMethod)
      return {
        success: false,
        message: "No payment methd found",
        redirectTo: "/payment-method",
      };

    //   create order obj
    const order = insertOrderSchema.parse({
      userId,
      shippingAddress: user.address,
      paymentMethod: user.paymentMethod,
      itemsPrice: cart.itemsPrice,
      shippingPrice: cart.shippingPrice,
      taxPrice: cart.taxPrice,
      totalPrice: cart.totalPrice,
    });

    // Create a transaction to create order & order items
    const newOrderId = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: order,
      });
      //   Create the order items
      for (const item of cart.items) {
        await tx.orderItem.create({
          data: {
            ...item,
            orderId: newOrder.id,
          },
        });
      }

      // Clear the cart
      await tx.cart.update({
        where: { id: cart.id },
        data: {
          items: [],
          totalPrice: 0,
          taxPrice: 0,
          shippingPrice: 0,
          itemsPrice: 0,
        },
      });

      return newOrder.id;
    });

    if (!newOrderId) throw new Error("Order not created");

    return {
      success: true,
      message: "Order created",
      redirectTo: `/order/${newOrderId}`,
    };
  } catch (error) {
    if (isRedirectError(error)) throw error;

    return { success: false, message: formatError(error) };
  }
}
