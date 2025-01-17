import { Metadata } from "next";
import CartTable from "./cart-table";
import { getMyCart } from "@/lib/actions/cart.action";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Cart",
};
const CartPage = async () => {
  const cart = await getMyCart();

  return (
    <div>
      <CartTable cart={cart} />
    </div>
  );
};

export default CartPage;
