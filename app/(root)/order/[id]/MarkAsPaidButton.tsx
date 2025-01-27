"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { updateCODOrderToPaid } from "@/lib/actions/order.actions";
import { useTransition } from "react";

type Props = {
  orderId: string;
};

const MarkAsPaidButton = ({ orderId }: Props) => {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleClick = () =>
    startTransition(async () => {
      const res = await updateCODOrderToPaid(orderId);

      toast({
        variant: !res.success ? "destructive" : "default",
        description: res.message,
      });
    });

  return (
    <Button type="button" disabled={isPending} onClick={handleClick}>
      {isPending ? "Processing" : "Mark as Paid"}
    </Button>
  );
};

export default MarkAsPaidButton;
