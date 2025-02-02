import { auth } from "@/auth";
import ProductForm from "@/components/admin/product-form";
import { getAllBrands } from "@/lib/actions/brand.action";
import { getAllCategories } from "@/lib/actions/category.action";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Product",
};
const CreateProductPage = async () => {
  const session = await auth();

  if (session?.user.role !== "admin") throw new Error("User is not authorized");

  const categories = await getAllCategories({});
  const brands = await getAllBrands({});

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <h2 className="h2-bold">Create Product</h2>
      <ProductForm
        type="create"
        categories={categories.data}
        brands={brands.data}
      />
    </div>
  );
};

export default CreateProductPage;
