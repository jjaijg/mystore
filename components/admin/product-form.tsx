"use client";

import { useToast } from "@/hooks/use-toast";
import { productDefaults } from "@/lib/constants";
import {
  insertProductSchema,
  updateProductSchema,
} from "@/lib/validationSchema/product.schema";
import { TProduct } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import slugify from "slugify";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { createProduct, updateProduct } from "@/lib/actions/product.actions";
import { Card, CardContent } from "../ui/card";
import Image from "next/image";
import { UploadButton } from "@/lib/uploadthing";
import { Checkbox } from "../ui/checkbox";
import { Trash2Icon } from "lucide-react";
import { Brand, Category } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useEffect } from "react";

type Props = {
  type: "create" | "update";
  productId?: string;
  product?: TProduct;
  categories: Category[];
  brands: Brand[];
};

const ProductForm = ({
  type,
  product,
  productId,
  categories,
  brands,
}: Props) => {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof insertProductSchema>>({
    resolver: zodResolver(
      type === "update" ? updateProductSchema : insertProductSchema
    ),
    defaultValues:
      product && type === "update"
        ? {
            ...product,
            categoryId: product.categoryId ?? undefined,
            brandId: product.brandId ?? undefined,
            discountPercent: product.discountPercent ?? undefined,
            price: product.price.toString(),
          }
        : productDefaults,
  });

  const onSubmit: SubmitHandler<z.infer<typeof insertProductSchema>> = async (
    data
  ) => {
    // On create
    if (type === "create") {
      const res = await createProduct(data);

      toast({
        variant: !res.success ? "destructive" : "default",
        description: res.message,
      });
      if (res.success) router.push("/admin/products");
    }
    // on update
    if (type === "update") {
      if (!productId) {
        router.push("/admin/products");
        return;
      }
      const res = await updateProduct({ ...data, id: productId });

      toast({
        variant: !res.success ? "destructive" : "default",
        description: res.message,
      });
      if (res.success) router.push("/admin/products");
    }
  };

  const { setValue, watch } = form;
  const prodName = watch("name");
  const images = watch("images");
  const isFeatured = watch("isFeatured");
  const banner = watch("banner");
  const price = watch("price");
  const discountPercent = watch("discountPercent");
  const discountedPrice =
    discountPercent && discountPercent > 0
      ? +price - (+price * discountPercent) / 100
      : 0;

  useEffect(() => {
    setValue("slug", slugify(prodName, { lower: true }));
  }, [prodName, setValue]);

  return (
    <>
      <Form {...form}>
        <form
          method="POST"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8"
        >
          <div className="flex flex-col gap-5 md:flex-row">
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Product Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Slug */}
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input placeholder="Enter Product slug" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex flex-col gap-5 md:flex-row">
            {/* Category */}
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Category</FormLabel>
                  <Select {...field} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Brand */}
            <FormField
              control={form.control}
              name="brandId"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Brand</FormLabel>
                  <Select {...field} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a brand" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {brands.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex flex-col gap-5 md:flex-row">
            {/* Price */}
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Product Price" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Stock */}
            <FormField
              control={form.control}
              name="stock"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Stock</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Product Stock" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-col gap-5 md:flex-row">
            {/* Discount % */}
            <FormField
              control={form.control}
              name="discountPercent"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Discount %</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter Product discount"
                      {...field}
                      value={field.value ?? undefined}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Discount price */}
            <FormItem className="w-full">
              <FormLabel>Discounted Price</FormLabel>
              <FormControl>
                <Input
                  placeholder="Discounted price"
                  disabled
                  value={discountedPrice}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </div>

          <div className="upload-field flex flex-col gap-5 md:flex-row">
            {/* Images */}
            <FormField
              control={form.control}
              name="images"
              render={() => (
                <FormItem className="w-full">
                  <FormLabel>Images</FormLabel>
                  <Card>
                    <CardContent className="space-y-2 mt-2 min-h-48">
                      <div className="flex-start space-x-2">
                        {images.map((image, idx) => (
                          <div key={image} className="relative">
                            <Image
                              src={image}
                              alt={"Product Image"}
                              className="w-20 h-20 object-cover object-center"
                              width={100}
                              height={100}
                            />
                            <Trash2Icon
                              className="absolute top-0 right-0 text-red-500 hover:opacity-70 cursor-pointer"
                              onClick={() => {
                                form.setValue(
                                  "images",
                                  images.toSpliced(idx, 1)
                                );
                              }}
                            />
                          </div>
                        ))}
                        <FormControl>
                          <UploadButton
                            endpoint={"imageUploader"}
                            onClientUploadComplete={(res) => {
                              form.setValue("images", [...images, res[0].url]);
                            }}
                            onUploadError={(error) => {
                              toast({
                                variant: "destructive",
                                description: `ERROR! ${error.message}`,
                              });
                            }}
                          />
                        </FormControl>
                      </div>
                    </CardContent>
                  </Card>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="upload-field">
            {/* isFeatured */}
            Featured Product
            <Card>
              <CardContent className="space-y-2 mt-2">
                <FormField
                  control={form.control}
                  name="isFeatured"
                  render={({ field }) => (
                    <FormItem className="space-x-2 items-center">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Is Featured</FormLabel>
                    </FormItem>
                  )}
                />
                {isFeatured && banner && (
                  <Image
                    src={banner}
                    alt="Banner image"
                    height={680}
                    width={1920}
                    className="w-full object-cover object-center rounded-sm"
                  />
                )}
                {isFeatured && !banner && (
                  <UploadButton
                    endpoint={"imageUploader"}
                    onClientUploadComplete={(res) => {
                      form.setValue("banner", res[0].url);
                    }}
                    onUploadError={(error) => {
                      toast({
                        variant: "destructive",
                        description: `ERROR! ${error.message}`,
                      });
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </div>
          <div>
            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter Product descrption"
                      {...field}
                      className="resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div>
            {/* Submit */}

            <Button
              type="submit"
              size={"lg"}
              className="button col-span-2 w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting
                ? "Submitting..."
                : `${type} Product`}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};

export default ProductForm;
