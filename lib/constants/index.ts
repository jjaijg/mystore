import { ShippingAddress } from "@/types";

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Mystore";
export const APP_DESCRIPTION =
  process.env.NEXT_PUBLIC_APP_DESCRIPTION ||
  "Ecommerce platform built with Next.js";
export const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

export const TIME_ZONE = process.env.TIME_ZONE || "Asia/Kolkata";

export const LATEST_PRODUCTS_LIMIT =
  Number(process.env.LATEST_PRODUCTS_LIMIT) || 4;

export const PAYMENT_METHODS = process.env.PAYMENT_METHODS
  ? process.env.PAYMENT_METHODS.split(",")
  : ["PayPal", "Stripe", "CashOnDelivery"];

export const DEFAULT_PAYMENT_METHOD =
  process.env.DEFAULT_PAYMENT_METHOD || "PayPal";

export const PAGE_SIZE = Number(process.env.PAGE_SIZE) || 2;

export const SENDER_EMAIL = process.env.SENDER_EMAIL || "onboarding@resend.dev";

export const shippingDefault: ShippingAddress = {
  fullName: "",
  streetAddress: "",
  city: "",
  postalCode: "",
  country: "",
  // fullName: "Jai Ganesh",
  // streetAddress: "address",
  // city: "city",
  // postalCode: "pincode",
  // country: "India",
};

export const productDefaults = {
  name: "",
  slug: "",
  images: [],
  description: "",
  price: "0",
  stock: 0,
  rating: "0",
  numReviews: "0",
  isFeatured: false,
  banner: null,
  discountPercent: 0,
  productVariants: [],
};

export const reviewFormDefaults = {
  title: "",
  description: "",
  rating: 0,
};

export const USER_ROLES = process.env.USER_ROLES
  ? process.env.USER_ROLES.split(",")
  : ["admin", "user"];
