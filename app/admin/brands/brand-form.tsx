"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { createOrUpdateBrand } from "@/lib/actions/brand.action";
import {
  BrandSchema,
  insertBrandSchema,
} from "@/lib/validationSchema/brand.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Brand } from "@prisma/client";
import { useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import slugify from "slugify";

type Props = {
  brand: Brand | undefined;
};

const BrandForm = ({ brand }: Props) => {
  const { toast } = useToast();
  const form = useForm<BrandSchema>({
    resolver: zodResolver(insertBrandSchema),
    defaultValues: {
      name: "",
      slug: "",
    },
  });

  const { watch, setValue } = form;
  const brandName = watch("name");

  useEffect(() => {
    if (brand) {
      setValue("name", brand.name);
      setValue("slug", brand.slug);
    }
  }, [brand, setValue]);

  useEffect(() => {
    setValue("slug", slugify(brandName, { lower: true }));
  }, [brandName, setValue]);

  const onsubmit: SubmitHandler<BrandSchema> = async (data) => {
    const res = await createOrUpdateBrand(data, brand?.id);
    if (res.success) form.reset();
    toast({
      variant: res.success ? "default" : "destructive",
      description: res.message,
    });
  };

  return (
    <>
      <Form {...form}>
        <form method="POST" onSubmit={form.handleSubmit(onsubmit)}>
          <div className="flex flex-col gap-5 md:flex-row justify-end">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Brand Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter slug" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full md:max-w-40 mt-auto">
              {form.formState.isSubmitting
                ? "Submitting..."
                : brand
                  ? "Update"
                  : "Create"}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};

export default BrandForm;
