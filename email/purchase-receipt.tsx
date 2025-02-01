// eslint-disable-next-line @typescript-eslint/no-require-imports
require("dotenv").config();

import sampleData from "@/db/sample-data";
import { dateFormatter, formatCurrency } from "@/lib/utils";
import { Order } from "@/types";
import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

type Props = {
  order: Order;
};

const myOrder = {
  id: "2324",
  userId: "123",
  user: {
    name: "Jai Ganesh",
    email: "test@test.com",
  },
  paymentMethod: "Stripe",
  shippingAddress: {
    fullName: "Jai Ganesh",
    streetAddress: "My street",
    city: "CHN",
    postalCode: "12346",
    country: "India",
  },
  createdAt: new Date(),
  totalPrice: "1000",
  taxPrice: "10",
  shippingPrice: "100",
  itemsPrice: "80",
  orderItems: sampleData.products.map((prod) => ({
    name: prod.name,
    orderId: "123",
    productId: "122324",
    slug: prod.slug,
    quantity: prod.stock,
    image: prod.images[0],
    price: prod.price.toString(),
  })),
  isDelivered: true,
  deliveredAt: new Date(),
  isPaid: true,
  paidAt: new Date(),
  paymentResult: {
    id: "12",
    status: "COMPLETED",
    pricePaid: "100",
    email_address: "test@test.com",
  },
};

PurchaseReceiptEmail.previewProps = {
  order: myOrder,
} satisfies Props;

export default function PurchaseReceiptEmail({ order }: Props) {
  return (
    <>
      <Html>
        <Preview>View order receipt</Preview>
        <Tailwind>
          <Head />
          <Body className="font-sans bg-white" />
          <Container className="max-w-xl">
            <Heading>Purchase</Heading>
            <Section>
              <Row>
                <Column>
                  <Text className="mb-0 mr-4 text-gray-500 whitespace-nowrap text-nowrap">
                    Order ID
                  </Text>
                  <Text className="mt-0 mr-4">{order.id}</Text>
                </Column>

                <Column>
                  <Text className="mb-0 mr-4 text-gray-500 whitespace-nowrap text-nowrap">
                    Purchase Date
                  </Text>
                  <Text className="mt-0 mr-4">
                    {dateFormatter.format(order.createdAt)}
                  </Text>
                </Column>

                <Column>
                  <Text className="mb-0 mr-4 text-gray-500 whitespace-nowrap text-nowrap">
                    Price Paid
                  </Text>
                  <Text className="mt-0 mr-4">
                    {formatCurrency(order.totalPrice)}
                  </Text>
                </Column>
              </Row>
            </Section>

            <Section className="border border-solid border-gray-500 rounded-lg p-4 md:p-6">
              {order.orderItems.map((item) => (
                <Row key={item.productId} className="mt-8">
                  <Column className="w-20">
                    <Img
                      src={
                        item.image.startsWith("/")
                          ? `${process.env.NEXT_PUBLIC_SERVER_URL}${item.image}`
                          : item.image
                      }
                      width={80}
                      alt={item.name}
                      className="rounded"
                    />
                  </Column>

                  <Column className="align-top">
                    {item.name} x {item.quantity}
                  </Column>
                  <Column className="align-top" align="right">
                    {formatCurrency(item.price)}
                  </Column>
                </Row>
              ))}
              {[
                { name: "Items", price: order.itemsPrice },
                { name: "Tax", price: order.taxPrice },
                { name: "Shipping", price: order.shippingPrice },
                { name: "Total", price: order.totalPrice },
              ].map(({ name, price }) => (
                <Row key={name} className="py-1">
                  <Column align="right">{name}:</Column>
                  <Column align="right" width={70} className="align-top">
                    <Text className="m-0">{formatCurrency(price)}</Text>
                  </Column>
                </Row>
              ))}
            </Section>
          </Container>
        </Tailwind>
      </Html>
    </>
  );
}
