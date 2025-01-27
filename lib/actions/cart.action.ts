"use server";

import { CartItem } from "@/types";
import { cookies } from "next/headers";
import { convertToPlainObject, formatError, round2 } from "../utils";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import {
  cartItemSchema,
  insertCartSchema,
} from "../validationSchema/cart.schema";
import { revalidatePath } from "next/cache";

// calculate cart prices
const calcPrice = (items: CartItem[]) => {
  const itemsPrice = round2(
      items.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0)
    ),
    shippingPrice = round2(itemsPrice > 1000 ? 0 : 100),
    taxPrice = round2(0.18 * itemsPrice),
    totalPrice = round2(itemsPrice + shippingPrice + taxPrice).toFixed(2);

  return {
    itemsPrice: itemsPrice.toFixed(2),
    shippingPrice: shippingPrice.toFixed(2),
    taxPrice: taxPrice.toFixed(2),
    totalPrice,
  };
};

export async function addItemToCart(item: CartItem) {
  try {
    // check for cart cookie
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;

    if (!sessionCartId) throw new Error("Cart session not found");

    // Get session & user id
    const session = await auth();
    const userId = session?.user.id;

    const cart = await getMyCart();

    // Parse & validate item
    const cartItem = cartItemSchema.parse(item);

    // find prod in db
    const product = await prisma.product.findFirst({
      where: { id: cartItem.productId },
    });

    if (!product) throw new Error("Product not found");

    if (!cart) {
      // create ne cart object
      const newCart = insertCartSchema.parse({
        userId,
        items: [cartItem],
        sessionCartId,
        ...calcPrice([cartItem]),
      });

      //   Add to db
      await prisma.cart.create({
        data: newCart,
      });

      // Revalidate the product
      revalidatePath(`/product/${product.slug}`);

      return { success: true, message: `${product.name} added to cart` };
    } else {
      // check if item already exists
      const idx = cart.items.findIndex(
        (i) => i.productId === cartItem.productId
      );

      // check if product already in cart
      if (idx !== -1) {
        const existingItem = cart.items[idx];
        // check the stock
        if (product.stock < existingItem.quantity + 1) {
          throw new Error("Not enough stock");
        }

        // increase the quantity
        cart.items[idx].quantity += 1;
      } else {
        // If product not in the cart already
        // check stock
        if (product.stock < 1) throw new Error("Not enough stock");

        // Add item to cart.items
        cart.items.push(cartItem);
      }

      // save to db
      await prisma.cart.update({
        where: { id: cart.id },
        data: {
          items: cart.items,
          ...calcPrice(cart.items),
        },
      });

      revalidatePath(`/product/${product.slug}`);

      return {
        success: true,
        message: `${product.name} ${
          idx === -1 ? "added to" : "updated in"
        } cart`,
      };
    }
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function removeItemFromCart(productId: string) {
  try {
    // check for cart cookie
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;

    if (!sessionCartId) throw new Error("Cart session not found");

    // Get product
    const product = await prisma.product.findFirst({
      where: { id: productId },
    });

    if (!product) throw new Error("Product not found");

    // get user cart from db
    const cart = await getMyCart();
    if (!cart) throw new Error("Cart not found");

    const idx = cart.items.findIndex((i) => i.productId === productId);

    if (idx === -1) throw new Error("Item not found");

    const existingItem = cart.items[idx];

    // check the quantity
    if (existingItem.quantity === 1) {
      // remov from cart
      cart.items.splice(idx, 1);
    } else {
      cart.items[idx].quantity -= 1;
    }

    // update cart in db
    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        items: cart.items,
        ...calcPrice(cart.items),
      },
    });

    revalidatePath(`/product/${product.slug}`);

    return {
      success: true,
      message: `${product.name} was ${
        existingItem.quantity === 1 ? "removed from" : "updated in"
      } cart`,
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function getMyCart() {
  try {
    // check for cart cookie
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;

    if (!sessionCartId) throw new Error("Cart session not found");

    // Get session & user id
    const session = await auth();
    const userId = session?.user.id;

    // get user cart from db
    const cart = await prisma.cart.findFirst({
      where: userId ? { userId } : { sessionCartId },
    });

    if (!cart) return null;

    // convert decimal & return
    return convertToPlainObject({
      ...cart,
      items: cart.items as CartItem[],
      itemsPrice: cart.itemsPrice.toString(),
      totalPrice: cart.totalPrice.toString(),
      shippingPrice: cart.shippingPrice.toString(),
      taxPrice: cart.taxPrice.toString(),
    });
  } catch (error) {
    console.log(error);
  }
}
