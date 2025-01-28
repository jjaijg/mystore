import { auth } from "@/auth";
import { getUserById } from "@/lib/actions/user.actions";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import UpdateUserForm from "./update-user-form";

export const metadata: Metadata = {
  title: "Edit User",
};

type Props = {
  params: Promise<{ id: string }>;
};

const EditUserPage = async ({ params }: Props) => {
  const session = await auth();

  if (session?.user.role !== "admin") throw new Error("User is not authorized");

  const { id } = await params;

  const user = await getUserById(id);

  if (!user) notFound();

  return (
    <div className="space-y-8 max-w-lg mx-auto">
      <h2 className="h2-bold">Update User</h2>
      <UpdateUserForm user={user} />
    </div>
  );
};

export default EditUserPage;
