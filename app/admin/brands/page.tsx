import { auth } from "@/auth";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import BrandForm from "./brand-form";
import BrandTable from "./brand-table";
import { getAllBrands } from "@/lib/actions/brand.action";

type Props = {
  searchParams: Promise<{
    id?: string;
    page: string;
    query: string;
  }>;
};
const BrandsPage = async ({ searchParams }: Props) => {
  const session = await auth();

  if (session?.user.role !== "admin") throw new Error("User is not authorized");

  const { id, ...searchData } = await searchParams;
  const page = Number(searchData.page) || 1;
  const searchText = searchData.query || "";

  const brands = await getAllBrands({
    query: searchText,
    page,
  });

  const brand = id ? brands.data.find((b) => b.id === id) : undefined;

  return (
    <>
      <div className="space-y-4">
        <div className="flex-between">
          <div className="flex items-center gap-3">
            <h2 className="h2-bold">Brands</h2>
            {searchText && (
              <div>
                Filtered by <i>&quot;{searchText}&quot;</i>
                <Link href={`/admin/brands`}>
                  <Button variant={"outline"} size={"sm"} className="ml-2">
                    Remove Filter
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        <Accordion type="single" collapsible defaultValue="brand">
          <AccordionItem value="brand">
            <AccordionTrigger>
              <h3 className="text-xl">{brand ? "Update" : "Create"} Brand</h3>
            </AccordionTrigger>
            <AccordionContent>
              <div className="p-2">
                <BrandForm brand={brand} />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="mt-10">
          <h3 className="text-xl">Category list</h3>
          <BrandTable brands={brands.data} />
        </div>
      </div>
    </>
  );
};

export default BrandsPage;
