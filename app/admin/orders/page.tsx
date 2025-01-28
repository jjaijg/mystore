import { auth } from "@/auth";
import DeleteDialog from "@/components/shared/delete-dialog";
import Pagination from "@/components/shared/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteOrder, getAllOrders } from "@/lib/actions/order.actions";
import { formatCurrency, formatDateTiem, formatId } from "@/lib/utils";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin Orders",
};

type Props = {
  searchParams: Promise<{ page: string; query: string }>;
};
const AdminOrdersPage = async ({ searchParams }: Props) => {
  const searchData = await searchParams;
  const page = searchData.page || 1;
  const searchText = searchData.query || "";

  const session = await auth();

  if (session?.user.role !== "admin") throw new Error("User is not authorized");

  const orders = await getAllOrders({ page: Number(page), query: searchText });

  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h2 className="h2-bold">Orders</h2>
          {searchText && (
            <div>
              Filtered by <i>&quot;{searchText}&quot;</i>
              <Link href={`/admin/orders`}>
                <Button variant={"outline"} size={"sm"} className="ml-2">
                  Remove Filter
                </Button>
              </Link>
            </div>
          )}
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>DATE</TableHead>
                <TableHead>BUYER</TableHead>
                <TableHead>TOTAL</TableHead>
                <TableHead>PAID</TableHead>
                <TableHead>DELIVERED</TableHead>
                <TableHead>ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.data.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{formatId(order.id)}</TableCell>
                  <TableCell>
                    {formatDateTiem(order.createdAt.toString()).dateTime}
                  </TableCell>
                  <TableCell>{order.user.name}</TableCell>
                  <TableCell>{formatCurrency(order.totalPrice)}</TableCell>
                  <TableCell>
                    {order.isPaid ? (
                      formatDateTiem(order.paidAt!.toString()).dateTime
                    ) : (
                      <Badge variant={"destructive"}>Not Paid</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {order.isDelivered ? (
                      formatDateTiem(order.deliveredAt!.toString()).dateTime
                    ) : (
                      <Badge variant={"destructive"}>Not delivered</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button asChild variant={"outline"} size={"sm"}>
                      <Link href={`/order/${order.id}`}>Details</Link>
                    </Button>
                    <DeleteDialog id={order.id} action={deleteOrder} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {orders.totalPages > 1 && (
            <Pagination
              page={Number(page) || 1}
              totalPages={orders.totalPages}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default AdminOrdersPage;
