"use server";

import { auth, signIn, signOut } from "@/auth";
import {
  signInFormSchema,
  signUpFormSchema,
} from "../validationSchema/user.schema";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { prisma } from "@/db/prisma";
import { formatError } from "../utils";
import { ShippingAddress } from "@/types";
import { shippingAddressSchema } from "../validationSchema/shippingAddress.schema";
import { hash } from "../encrypt";

export async function signInWithCredentials(
  prevState: unknown,
  formData: FormData
) {
  try {
    const user = signInFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    await signIn("credentials", user);

    return { success: true, message: "Signed in successfully" };
  } catch (error) {
    if (isRedirectError(error)) throw error;

    return { success: false, message: "Invalid credentails" };
  }
}

export async function signUpUser(prevState: unknown, formdata: FormData) {
  try {
    const { confirmPassword, ...user } = signUpFormSchema.parse({
      name: formdata.get("name"),
      email: formdata.get("email"),
      password: formdata.get("password"),
      confirmPassword: formdata.get("confirmPassword"),
    });
    user.password = await hash(user.password);

    await prisma.user.create({
      data: user,
    });

    await signIn("credentials", {
      email: user.email,
      password: confirmPassword,
    });

    return { success: true, message: "User registered successfully" };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { success: false, message: formatError(error) };
  }
}

export async function signOutUser() {
  await signOut();
}

export async function getUserById(userId: string) {
  const user = await prisma.user.findFirst({ where: { id: userId } });

  if (!user) throw new Error("User not found");

  return user;
}

export async function updateUserAddress(data: ShippingAddress) {
  try {
    const session = await auth();

    const currentUser = await prisma.user.findFirst({
      where: { id: session?.user.id },
    });

    if (!currentUser) throw new Error("User not found");

    const address = shippingAddressSchema.parse(data);

    await prisma.user.update({
      where: { id: currentUser.id },
      data: { address },
    });

    return { success: true, message: "User address updated successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
