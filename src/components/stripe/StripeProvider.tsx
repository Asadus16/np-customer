"use client";

import { ReactNode } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY || "");

interface StripeProviderProps {
  children: ReactNode;
  clientSecret?: string;
}

export default function StripeProvider({ children, clientSecret }: StripeProviderProps) {
  const options = clientSecret
    ? {
        clientSecret,
        appearance: {
          theme: "stripe" as const,
          variables: {
            colorPrimary: "#6950f3",
            colorBackground: "#ffffff",
            colorText: "#1f2937",
            colorDanger: "#dc2626",
            fontFamily: "system-ui, sans-serif",
            borderRadius: "12px",
          },
        },
      }
    : undefined;

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
}
