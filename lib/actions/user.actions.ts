"use server";

import { signIn, signOut } from "@/auth";
import {
  signInFormSchema,
  signUpFormSchema,
} from "../validationSchema/user.schema";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { hashSync } from "bcrypt-ts-edge";
import { prisma } from "@/db/prisma";

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
    console.log("error :>> ", error);
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
    console.log("error :>> ", error);
    if (isRedirectError(error)) throw error;

    return { success: false, message: "User was no registered" };
  }
}

export async function signOutUser() {
  await signOut();
}
