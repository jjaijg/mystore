"use server";

import { prisma } from "@/db/prisma";
import { PaginatedResp, SearchParams } from "@/types";
import { Category, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { formatError } from "../utils";
import { CategorySchema } from "../validationSchema/category.schema";

type StatusReturn = {
  success: boolean;
  message: string;
};

// Create category
export const createOrUpdateCategory = async (
  data: CategorySchema,
  id?: string
): Promise<StatusReturn> => {
  try {
    if (id) {
      // update category
      const existingCategory = await prisma.category.findFirst({
        where: { id },
      });

      if (!existingCategory) throw new Error("Category not found!");

      await prisma.category.update({
        where: { id },
        data: {
          name: data.name,
          slug: data.slug,
        },
      });
    } else {
      // Create category
      await prisma.category.create({ data });
    }
    revalidatePath(`/admin/categories`);
    return {
      success: true,
      message: `Category ${id ? "updated" : "created"} successfully`,
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
};

// Get all categories
export async function getAllCategories({
  query,
}: SearchParams): Promise<PaginatedResp<Category>> {
  const queryFilter: Prisma.CategoryWhereInput =
    query && query !== "all"
      ? {
          name: { contains: query, mode: Prisma.QueryMode.insensitive },
        }
      : {};
  const data = await prisma.category.findMany({
    where: queryFilter,
    orderBy: { name: "asc" },
  });

  const dataCount = await prisma.category.count({ where: queryFilter });

  return {
    data,
    totalPages: dataCount, // Math.ceil(dataCount / limit),
  };
}

// Delete a Category
export async function deleteCategory(id: string) {
  try {
    const product = await prisma.category.findFirst({ where: { id } });

    if (!product) throw new Error("Category not found");

    await prisma.category.delete({ where: { id } });

    revalidatePath(`/admin/categories`);
    return { success: true, message: "Category deleted successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
