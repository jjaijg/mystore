import { auth } from "@/auth";
import { getMyCart } from "@/lib/actions/cart.action";
import { getUserById } from "@/lib/actions/user.actions";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metdata: Metadata = {
  title: "Shipping Address",
};

const ShippingAddressPage = async () => {
  const session = await auth();
  const userId = session?.user.id;

  if (!userId) throw new Error("Session not established");

  const cart = await getMyCart();
  if (!cart || cart.items.length === 0) redirect("/cart");

  const user = getUserById(userId);

  return null;
};

export default ShippingAddressPage;
