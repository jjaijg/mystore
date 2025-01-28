import { auth } from "@/auth";
import ProductForm from "@/components/admin/product-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Product",
};
const CreateProductPage = async () => {
  const session = await auth();

  if (session?.user.role !== "admin") throw new Error("User is not authorized");

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <h2 className="h2-bold">Create Product</h2>
      <ProductForm type="create" />
    </div>
  );
};

export default CreateProductPage;
