"use server";

import { prisma } from "@/db/prisma";
import { PaginatedResp, SearchParams } from "@/types";
import { Brand, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { formatError } from "../utils";
import { BrandSchema } from "../validationSchema/brand.schema";

type StatusReturn = {
  success: boolean;
  message: string;
};

// Create category
export const createOrUpdateBrand = async (
  data: BrandSchema,
  id?: string
): Promise<StatusReturn> => {
  try {
    if (id) {
      // update brand
      const existingBrand = await prisma.brand.findFirst({
        where: { id },
      });

      if (!existingBrand) throw new Error("Brand not found!");

      await prisma.brand.update({
        where: { id },
        data: {
          name: data.name,
          slug: data.slug,
        },
      });
    } else {
      // Create brand
      await prisma.brand.create({ data });
    }
    revalidatePath(`/admin/brands`);
    return {
      success: true,
      message: `Brand ${id ? "updated" : "created"} successfully`,
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
};

// Get all categories
export async function getAllBrands({
  query,
}: SearchParams): Promise<PaginatedResp<Brand>> {
  const queryFilter: Prisma.BrandWhereInput =
    query && query !== "all"
      ? {
          name: { contains: query, mode: Prisma.QueryMode.insensitive },
        }
      : {};
  const data = await prisma.brand.findMany({
    where: queryFilter,
    orderBy: { name: "asc" },
  });

  const dataCount = await prisma.brand.count({ where: queryFilter });

  return {
    data,
    totalPages: dataCount, // Math.ceil(dataCount / limit),
  };
}

// Delete a Brand
export async function deleteBrand(id: string) {
  try {
    const product = await prisma.brand.findFirst({ where: { id } });

    if (!product) throw new Error("Brand not found");

    await prisma.brand.delete({ where: { id } });

    revalidatePath(`/admin/brands`);
    return { success: true, message: "Brand deleted successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
