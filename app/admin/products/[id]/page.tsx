import { auth } from "@/auth";
import ProductForm from "@/components/admin/product-form";
import { getProductById } from "@/lib/actions/product.actions";
import { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Edit Product",
};

type Props = {
  params: Promise<{ id: string }>;
};

const EditProductPage = async ({ params }: Props) => {
  const session = await auth();

  if (session?.user.role !== "admin") throw new Error("User is not authorized");

  const { id } = await params;

  const product = await getProductById(id);

  if (!product) notFound();

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <h2 className="h2-bold">Update Product</h2>
      <ProductForm type="update" product={product} productId={id} />
    </div>
  );
};

export default EditProductPage;
