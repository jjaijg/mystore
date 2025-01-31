import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  LinkAuthenticationElement,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useTheme } from "next-themes";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { SERVER_URL } from "@/lib/constants";
type Props = {
  priceInCents: number;
  orderId: string;
  clientSecret: string;
};

const StripePayment = ({ orderId, priceInCents, clientSecret }: Props) => {
  const { theme, systemTheme } = useTheme();
  const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
  );

  //   Stripe form component
  const StripeForm = () => {
    const stripe = useStripe();
    const elements = useElements();

    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async (e: FormEvent) => {
      e.preventDefault();

      if (stripe === null || elements === null || email === null) return;

      setIsLoading(true);

      stripe
        .confirmPayment({
          elements,
          confirmParams: {
            return_url: `${SERVER_URL}/order/${orderId}/stripe-payment-success`,
          },
        })
        .then(({ error }) => {
          if (
            error.type === "card_error" ||
            error.type === "validation_error"
          ) {
            setErrorMessage(error.message ?? "An unknown error occured");
          } else if (error) {
            setErrorMessage("An unknown error occured.");
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    };

    return (
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="text-xl">Stripe Checkout</div>
        {errorMessage && <div className="text-destructive">{errorMessage}</div>}
        <PaymentElement />
        <div>
          <LinkAuthenticationElement
            onChange={(e) => setEmail(e.value.email)}
          />
        </div>
        <Button
          className="w-full"
          size={"lg"}
          disabled={stripe === null || elements === null || isLoading}
        >
          {isLoading
            ? "Purchasing..."
            : `Purchase ${formatCurrency(priceInCents / 100)}`}
        </Button>
      </form>
    );
  };

  return (
    <>
      <Elements
        options={{
          clientSecret,
          appearance: {
            theme:
              theme === "dark"
                ? "night"
                : theme === "light"
                ? "stripe"
                : systemTheme === "light"
                ? "stripe"
                : "night",
          },
        }}
        stripe={stripePromise}
      >
        <StripeForm />
      </Elements>
    </>
  );
};

export default StripePayment;
