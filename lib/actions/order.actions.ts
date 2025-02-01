"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { convertToPlainObject, formatError } from "../utils";
import { auth } from "@/auth";
import { getMyCart } from "./cart.action";
import { getUserById } from "./user.actions";
import { insertOrderSchema } from "../validationSchema/order.schema";
import { prisma } from "@/db/prisma";
import { paypal } from "../paypal";
import { PaymentResult, SalesDataType, ShippingAddress } from "@/types";
import { revalidatePath } from "next/cache";
import { PAGE_SIZE } from "../constants";
import { Prisma } from "@prisma/client";
import { sendPurchaseReceipt } from "@/email";

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

// get order by id
export async function getOrderById(orderId: string) {
  const data = await prisma.order.findFirst({
    where: { id: orderId },
    include: {
      orderItems: true,
      user: {
        select: { name: true, email: true },
      },
    },
  });

  return convertToPlainObject(data);
}

// create new Paypal order
export async function createPaypalOrder(orderId: string) {
  try {
    // Get order from DB
    const order = await prisma.order.findFirst({ where: { id: orderId } });

    if (!order) throw new Error("Order not found");

    // Create new paypal order
    const paypalOrder = await paypal.createOrder(Number(order.totalPrice));

    // update order with paypal order id
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentResult: {
          id: paypalOrder.id,
          email_address: "",
          status: "",
          pricePaid: 0,
        },
      },
    });

    return {
      success: true,
      message: "Item order created successfully",
      data: paypalOrder.id,
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Approve paypal order and update order to paid
// orderID -> paypal order id
export async function approvePaypalOrder(
  orderId: string,
  data: { orderID: string }
) {
  try {
    // Get order from DB
    const order = await prisma.order.findFirst({ where: { id: orderId } });

    if (!order) throw new Error("Order not found");

    // Create new paypal order
    const captureData = await paypal.capturePayment(data.orderID);

    if (
      !captureData ||
      captureData.id !== (order.paymentResult as PaymentResult)?.id ||
      captureData.status !== "COMPLETED"
    ) {
      throw new Error("Error in paypal payment");
    }

    // update order to paid
    await updateOrderToPaid({
      orderId,
      paymentResult: {
        id: captureData.id,
        email_address: captureData.payer.email_address,
        status: captureData.status,
        pricePaid:
          captureData.purchase_units[0]?.payments?.captures[0]?.amount?.value,
      },
    });

    revalidatePath(`/order/${orderId}`);

    return {
      success: true,
      message: "Your order has been paid",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// update order to paid
export async function updateOrderToPaid({
  orderId,
  paymentResult,
}: {
  orderId: string;
  paymentResult?: PaymentResult;
}) {
  // Get order from DB
  const order = await prisma.order.findFirst({
    where: { id: orderId },
    include: {
      orderItems: true,
    },
  });

  if (!order) throw new Error("Order not found");
  if (order.isPaid) throw new Error("Order is already paid");

  // Transaction to update order and account for order stock
  await prisma.$transaction(async (tx) => {
    // Iterate over products and update the stock

    for (const item of order.orderItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: { increment: -item.quantity },
        },
      });
    }

    // Set the order to paid
    await tx.order.update({
      where: { id: orderId },
      data: {
        isPaid: true,
        paidAt: new Date(),
        paymentResult,
      },
    });
  });

  // Get updated order after the transaction
  const updatedOrder = await prisma.order.findFirst({
    where: { id: orderId },
    include: {
      orderItems: true,
      user: {
        select: { name: true, email: true },
      },
    },
  });

  if (!updatedOrder) throw new Error("Order not found");

  sendPurchaseReceipt({
    order: {
      ...updatedOrder,
      shippingAddress: updatedOrder.shippingAddress as ShippingAddress,
      paymentResult: updatedOrder.paymentResult as PaymentResult,
    },
  });
}

// get user orders
export async function getMyOrders({
  limit = PAGE_SIZE,
  page,
}: {
  limit?: number;
  page: number;
}) {
  const session = await auth();

  if (!session) throw new Error("User is not authorized");

  const data = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: (page - 1) * limit,
  });

  const dataCount = await prisma.order.count({
    where: { userId: session.user.id },
  });

  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
  };
}

// Get sales data and order summary
export async function getOrderSummary() {
  // Get the counts for each resource
  const ordersCount = await prisma.order.count();
  const productsCount = await prisma.product.count();
  const usersCount = await prisma.user.count();

  // Calculate the total sales
  const totalSales = await prisma.order.aggregate({
    _sum: { totalPrice: true },
  });

  // Get monthly sales
  const salesDataRaw = await prisma.$queryRaw<
    { month: string; totalSales: Prisma.Decimal }[]
  >`
  select to_char("createdAt", 'MM/YY') as "month", sum("totalPrice") as "totalSales" 
  from "Order" group by to_char("createdAt", 'MM/YY')
  `;

  const monthlySales: SalesDataType[] = salesDataRaw.map((data) => ({
    ...data,
    totalSales: Number(data.totalSales),
  }));

  // Get latest sales
  const latestSales = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true } },
    },
    take: 6,
  });

  return {
    ordersCount,
    productsCount,
    usersCount,
    totalSales,
    monthlySales,
    latestSales,
  };
}

// Get all orders
export async function getAllOrders({
  limit = PAGE_SIZE,
  page,
  query,
}: {
  limit?: number;
  page: number;
  query: string;
}) {
  const filter: Prisma.OrderWhereInput =
    query && query !== "all"
      ? {
          user: { name: { contains: query, mode: "insensitive" } },
        }
      : {};
  const data = await prisma.order.findMany({
    where: filter,
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: (page - 1) * limit,
    include: {
      user: { select: { name: true } },
    },
  });

  const dataCount = await prisma.order.count({ where: filter });

  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
  };
}

// Delete an order
export async function deleteOrder(id: string) {
  try {
    await prisma.order.delete({
      where: { id },
    });

    revalidatePath(`/admin/orders`);

    return { success: true, message: "Order deleted successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// update COD order to paid
export async function updateCODOrderToPaid(orderId: string) {
  try {
    await updateOrderToPaid({ orderId });

    revalidatePath(`/order/${orderId}`);

    return { success: true, message: "Order marked as paid" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// update COD order to delivered
export async function deliverOrder(orderId: string) {
  try {
    const order = await prisma.order.findFirst({ where: { id: orderId } });

    if (!order) throw new Error("Order not found");

    if (!order.isPaid) throw new Error("Order not paid");

    await prisma.order.update({
      where: { id: orderId },
      data: {
        isDelivered: true,
        deliveredAt: new Date(),
      },
    });

    revalidatePath(`/order/${orderId}`);

    return { success: true, message: "Order marked as delivered" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
