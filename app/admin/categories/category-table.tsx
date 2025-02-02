"use client";

import DeleteDialog from "@/components/shared/delete-dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteCategory } from "@/lib/actions/category.action";
import { formatId } from "@/lib/utils";
import { Category } from "@prisma/client";
import { useRouter } from "next/navigation";

type Props = {
  categories: Category[];
};

const CategoryTable = ({ categories }: Props) => {
  const router = useRouter();
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>NAME</TableHead>
            <TableHead>SLUG</TableHead>
            <TableHead className="w-[100px]">ACTIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((c) => (
            <TableRow key={c.id}>
              <TableCell>{formatId(c.id)}</TableCell>
              <TableCell>{c.name}</TableCell>
              <TableCell>{c.slug}</TableCell>
              <TableCell className="flex gap-1">
                <Button
                  variant={"outline"}
                  size="sm"
                  onClick={() => {
                    router.push(`/admin/categories?id=${c.id}`);
                  }}
                >
                  Edit
                </Button>
                <DeleteDialog id={c.id} action={deleteCategory} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};

export default CategoryTable;
