// eslint-disable-next-line @typescript-eslint/no-require-imports
require("dotenv").config();
import { APP_NAME, SENDER_EMAIL } from "@/lib/constants";
import { Resend } from "resend";
import { Order } from "@/types";
import PurchaseReceiptEmail from "./purchase-receipt";

const resend = new Resend(process.env.RESEND_API_KEY as string);

export const sendPurchaseReceipt = async ({ order }: { order: Order }) => {
  await resend.emails.send({
    from: `${APP_NAME} <${SENDER_EMAIL}>`,
    to: order.user.email,
    subject: `Order confirmation ${order.id}`,
    react: (
      <>
        <PurchaseReceiptEmail order={order} />
      </>
    ),
  });
};
