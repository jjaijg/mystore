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
import { createOrUpdateCategory } from "@/lib/actions/category.action";
import {
  CategorySchema,
  insertCategorySchema,
} from "@/lib/validationSchema/category.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Category } from "@prisma/client";
import { useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import slugify from "slugify";

type Props = {
  category: Category | undefined;
};

const CategoryForm = ({ category }: Props) => {
  const { toast } = useToast();
  const form = useForm<CategorySchema>({
    resolver: zodResolver(insertCategorySchema),
    defaultValues: {
      name: "",
      slug: "",
    },
  });

  const { watch, setValue } = form;
  const catName = watch("name");

  useEffect(() => {
    if (category) {
      setValue("name", category.name);
      setValue("slug", category.slug);
    }
  }, [category, setValue]);

  useEffect(() => {
    setValue("slug", slugify(catName, { lower: true }));
  }, [catName, setValue]);

  const onsubmit: SubmitHandler<CategorySchema> = async (data) => {
    const res = await createOrUpdateCategory(data, category?.id);
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
                    <Input placeholder="Enter Category Name" {...field} />
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
                : category
                  ? "Update"
                  : "Create"}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};

export default CategoryForm;
