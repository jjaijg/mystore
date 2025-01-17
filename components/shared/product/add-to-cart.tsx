"use client";

import { Button } from "@/components/ui/button";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import { addItemToCart, removeItemFromCart } from "@/lib/actions/cart.action";
import { Cart, CartItem } from "@/types";
import { Plus, Minus, Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

type Props = {
  item: CartItem;
  cart: Cart | undefined | null;
};

const AddToCart = ({ item, cart }: Props) => {
  const router = useRouter();
  const { toast } = useToast();

  const [isPending, startTransition] = useTransition();

  const handleAddToCart = async () => {
    startTransition(async () => {
      const resp = await addItemToCart(item);
      const isSuccess = resp.success;

      toast({
        variant: isSuccess ? "default" : "destructive",
        description: resp.message,
        action: isSuccess ? (
          <ToastAction
            className="bg-primary text-white hover:bg-gray-800"
            altText="Go To Cart"
            onClick={() => router.push("/cart")}
          >
            Go To Cart
          </ToastAction>
        ) : undefined,
      });
    });
  };

  const handleRemoveFromCart = async () => {
    startTransition(async () => {
      const resp = await removeItemFromCart(item.productId);

      toast({
        variant: resp.success ? "default" : "destructive",
        description: resp.message,
      });
      return;
    });
  };

  // check if item is in cart
  const existItem =
    cart && cart.items.find((i) => i.productId === item.productId);

  return existItem ? (
    <div>
      <Button
        type="button"
        variant={"outline"}
        disabled={isPending}
        onClick={handleRemoveFromCart}
      >
        {isPending ? (
          <Loader className="h-4 w-4 animate-spin" />
        ) : (
          <Minus className="h-4 w-4" />
        )}
      </Button>
      <span className="px-2">{existItem.quantity}</span>
      <Button
        type="button"
        variant={"outline"}
        disabled={isPending}
        onClick={handleAddToCart}
      >
        {isPending ? (
          <Loader className="h-4 w-4 animate-spin" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
      </Button>
    </div>
  ) : (
    <Button
      className="w-full"
      type="button"
      disabled={isPending}
      onClick={handleAddToCart}
    >
      {isPending ? (
        <Loader className="h-4 w-4 animate-spin" />
      ) : (
        <Plus className="h-4 w-4" />
      )}
      Add to cart
    </Button>
  );
};

export default AddToCart;
