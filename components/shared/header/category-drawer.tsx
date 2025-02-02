import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { getAllCategories } from "@/lib/actions/product.actions";
import { MenuIcon } from "lucide-react";
import Link from "next/link";

const CategoryDrawer = async () => {
  const categories = await getAllCategories();
  return (
    <>
      <Drawer direction="left">
        <DrawerTrigger asChild>
          <Button variant={"outline"}>
            <MenuIcon />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="h-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Select a category</DrawerTitle>
            <div className="space-y-1 mt-4">
              {categories.map((cat) => (
                <Button
                  asChild
                  key={cat.name}
                  variant={"ghost"}
                  className="w-full justify-start"
                >
                  <DrawerClose asChild>
                    <Link href={`/search?category=${cat.name}`}>
                      {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}{" "}
                      {cat._count.products}
                    </Link>
                  </DrawerClose>
                </Button>
              ))}
            </div>
          </DrawerHeader>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default CategoryDrawer;
