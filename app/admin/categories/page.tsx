import { auth } from "@/auth";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { getAllCategories } from "@/lib/actions/category.action";
import Link from "next/link";
import CategoryForm from "./category-form";
import CategoryTable from "./category-table";

type Props = {
  searchParams: Promise<{
    id?: string;
    page: string;
    query: string;
  }>;
};
const CategoriesPages = async ({ searchParams }: Props) => {
  const session = await auth();

  if (session?.user.role !== "admin") throw new Error("User is not authorized");

  const { id, ...searchData } = await searchParams;
  const page = Number(searchData.page) || 1;
  const searchText = searchData.query || "";

  const categories = await getAllCategories({
    query: searchText,
    page,
  });

  const category = id ? categories.data.find((c) => c.id === id) : undefined;

  return (
    <>
      <div className="space-y-4">
        <div className="flex-between">
          <div className="flex items-center gap-3">
            <h2 className="h2-bold">Categories</h2>
            {searchText && (
              <div>
                Filtered by <i>&quot;{searchText}&quot;</i>
                <Link href={`/admin/categories`}>
                  <Button variant={"outline"} size={"sm"} className="ml-2">
                    Remove Filter
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        <Accordion type="single" collapsible defaultValue="category">
          <AccordionItem value="category">
            <AccordionTrigger>
              <h3 className="text-xl">
                {category ? "Update" : "Create"} Category
              </h3>
            </AccordionTrigger>
            <AccordionContent>
              <div className="p-2">
                <CategoryForm category={category} />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="mt-10">
          <h3 className="text-xl">Category list</h3>
          <CategoryTable categories={categories.data} />
        </div>
      </div>
    </>
  );
};

export default CategoriesPages;
