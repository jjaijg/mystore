"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { deliverOrder } from "@/lib/actions/order.actions";
import { useTransition } from "react";

type Props = {
  orderId: string;
};

const MarkAsDeliveredButton = ({ orderId }: Props) => {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleClick = () =>
    startTransition(async () => {
      const res = await deliverOrder(orderId);

      toast({
        variant: !res.success ? "destructive" : "default",
        description: res.message,
      });
    });

  return (
    <Button type="button" disabled={isPending} onClick={handleClick}>
      {isPending ? "Processing" : "Mark as Delivered"}
    </Button>
  );
};

export default MarkAsDeliveredButton;
