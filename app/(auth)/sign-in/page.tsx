import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { APP_NAME } from "@/lib/constants";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SignInForm from "./SignInForm";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Sign In",
};

type Props = {
  searchParams: Promise<{
    callbackUrl: string;
  }>;
};
const SignInPage = async ({ searchParams }: Props) => {
  const session = await auth();
  const { callbackUrl } = await searchParams;

  if (session) redirect(callbackUrl || "/");

  return (
    <div className="w-full max-w-md mx-auto">
      <Card>
        <CardHeader className="spac-y-4">
          <Link href={"/"} className="flex-center">
            <Image
              src={"/images/logo.svg"}
              alt={`${APP_NAME} Logo`}
              width={100}
              height={100}
              priority
            />
          </Link>
          <CardTitle className="text-center">Sign In</CardTitle>
          <CardDescription className="text-center">
            Sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SignInForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default SignInPage;
