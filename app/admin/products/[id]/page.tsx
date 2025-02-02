import { auth } from "@/auth";
import ProductForm from "@/components/admin/product-form";
import { getAllBrands } from "@/lib/actions/brand.action";
import { getAllCategories } from "@/lib/actions/category.action";
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

  const categories = await getAllCategories({});
  const brands = await getAllBrands({});

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <h2 className="h2-bold">Update Product</h2>
      <ProductForm
        type="update"
        product={product}
        productId={id}
        categories={categories.data}
        brands={brands.data}
      />
    </div>
  );
};

export default EditProductPage;
