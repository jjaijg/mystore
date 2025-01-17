"use server";

import { signIn, signOut } from "@/auth";
import {
  signInFormSchema,
  signUpFormSchema,
} from "../validationSchema/user.schema";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { hashSync } from "bcrypt-ts-edge";
import { prisma } from "@/db/prisma";
import { formatError } from "../utils";

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
    user.password = hashSync(user.password, 10);

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
