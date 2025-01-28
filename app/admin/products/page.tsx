import { auth } from "@/auth";
import DeleteDialog from "@/components/shared/delete-dialog";
import Pagination from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteProduct, getAllProducts } from "@/lib/actions/product.actions";
import { formatCurrency, formatId } from "@/lib/utils";
import Link from "next/link";

type Props = {
  searchParams: Promise<{
    page: string;
    query: string;
    category: string;
  }>;
};

const AdminProductsPage = async ({ searchParams }: Props) => {
  const session = await auth();

  if (session?.user.role !== "admin") throw new Error("User is not authorized");

  const searchData = await searchParams;
  const page = Number(searchData.page) || 1;
  const searchText = searchData.query || "";
  const category = searchData.category || "";

  const products = await getAllProducts({
    query: searchText,
    page,
    category,
  });

  return (
    <>
      <div className="space-y-2">
        <div className="flex-between">
          <h2 className="h2-bold">Products</h2>
          <Button asChild>
            <Link href={`/admin/products/create`}>Create Product</Link>
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>NAME</TableHead>
              <TableHead className="text-right">PRICE</TableHead>
              <TableHead>CATEGORY</TableHead>
              <TableHead>STOCK</TableHead>
              <TableHead>RATING</TableHead>
              <TableHead className="w-[100px]">ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.data.map((prod) => (
              <TableRow key={prod.id}>
                <TableCell>{formatId(prod.id)}</TableCell>
                <TableCell>{prod.name}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(prod.price)}
                </TableCell>
                <TableCell>{prod.category}</TableCell>
                <TableCell>{prod.stock}</TableCell>
                <TableCell>{prod.rating}</TableCell>
                <TableCell className="flex gap-1">
                  <Button asChild variant={"outline"} size="sm">
                    <Link href={`/admin/products/${prod.id}`}>Edit</Link>
                  </Button>
                  <DeleteDialog id={prod.id} action={deleteProduct} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {products.totalPages && products.totalPages > 1 && (
          <Pagination page={page} totalPages={products.totalPages} />
        )}
      </div>
    </>
  );
};

export default AdminProductsPage;
