"use server";
import { prisma } from "@/db/prisma";
import { convertToPlainObject, formatError } from "../utils";
import { LATEST_PRODUCTS_LIMIT, PAGE_SIZE } from "../constants";
import { revalidatePath } from "next/cache";
import { UpdateProduct } from "@/types";
import {
  InserProductSchema,
  insertProductSchema,
  updateProductSchema,
} from "../validationSchema/product.schema";
import { UTApi } from "uploadthing/server";
import { Prisma } from "@prisma/client";

// Get latest products
export async function getLatestProducts() {
  const data = await prisma.product.findMany({
    include: {
      category: { select: { name: true } },
      brand: { select: { name: true } },
    },
    take: LATEST_PRODUCTS_LIMIT,
    orderBy: { createdAt: "desc" },
  });

  return convertToPlainObject(data);
}

// Get product by slug
export async function getProductBySlug(slug: string) {
  return await prisma.product.findFirst({
    where: {
      slug,
    },
    include: {
      category: { select: { name: true } },
      brand: { select: { name: true } },
    },
  });
}

// Get product by product id
export async function getProductById(id: string) {
  const data = await prisma.product.findFirst({
    where: {
      id,
    },
    include: {
      category: { select: { name: true, slug: true } },
      brand: { select: { name: true, slug: true } },
      productVariants: true,
    },
  });

  return convertToPlainObject(data);
}

// Get all products
export async function getAllProducts({
  query,
  category,
  limit = PAGE_SIZE,
  page,
  price,
  rating,
  sort,
}: {
  query: string;
  limit?: number;
  page: number;
  category?: string;
  price?: string;
  sort?: string;
  rating?: string;
}) {
  const queryFilter: Prisma.ProductWhereInput =
    query && query !== "all"
      ? {
          name: { contains: query, mode: Prisma.QueryMode.insensitive },
        }
      : {};
  const categoryFilter: Prisma.ProductWhereInput =
    category && category !== "all"
      ? {
          category: {
            name: { contains: category, mode: Prisma.QueryMode.insensitive },
          },
        }
      : {};
  const priceFilter: Prisma.ProductWhereInput =
    price && price !== "all"
      ? {
          price: {
            gte: Number(price.split("-")[0]),
            lte: Number(price.split("-")[1]),
          },
        }
      : {};
  const ratingFilter: Prisma.ProductWhereInput =
    rating && rating !== "all"
      ? {
          rating: {
            gte: Number(rating),
          },
        }
      : {};
  const data = await prisma.product.findMany({
    where: {
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    },
    include: {
      category: { select: { name: true, slug: true } },
      brand: { select: { name: true, slug: true } },
    },
    orderBy:
      sort === "lowest"
        ? { price: "asc" }
        : sort === "highest"
          ? { price: "desc" }
          : sort === "rating"
            ? { rating: "desc" }
            : { createdAt: "desc" },
    take: limit,
    skip: (page - 1) * limit,
  });
  const dataCount = await prisma.product.count({
    where: {
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    },
  });

  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
  };
}

// Delete a product
export async function deleteProduct(id: string) {
  try {
    const product = await prisma.product.findFirst({ where: { id } });

    if (!product) throw new Error("Product not found");

    await prisma.product.delete({ where: { id } });

    revalidatePath(`/admin/products`);
    return { success: true, message: "Product deleted successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Create a product
export async function createProduct(data: InserProductSchema) {
  try {
    const { productVariants, ...product } = insertProductSchema.parse(data);
    const prod = await prisma.product.create({
      data: product,
    });

    if (productVariants) {
      await prisma.productVariant.createMany({
        data: productVariants.map((p) => ({ ...p, productId: prod.id })),
      });
    }

    revalidatePath(`/admin/products`);
    return { success: true, message: "Product created successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Update a product
export async function updateProduct(data: UpdateProduct) {
  try {
    const product = updateProductSchema.parse(data);

    const prodExists = await prisma.product.findFirst({
      where: { id: product.id },
    });

    if (!prodExists) throw new Error("Product not found");

    const imagesToBeRemoved = prodExists.images
      .filter(
        (img) => !data.images.includes(img) && !img.startsWith("/images") //Local images
      )
      .map((img) => img.split("/").pop()!); //gets image id

    const { productVariants, ...productData } = product;
    await prisma.product.update({
      where: { id: product.id },
      data: productData,
    });

    await prisma.productVariant.deleteMany({
      where: { productId: product.id },
    });

    if (productVariants)
      await prisma.productVariant.createMany({
        data: productVariants.map((p) => ({ ...p, productId: product.id })),
      });

    // Remove images from uploadthing
    if (imagesToBeRemoved.length) {
      await deleteImages(imagesToBeRemoved);
    }

    revalidatePath(`/admin/products`);
    return { success: true, message: "Product updated successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Get featured products
export async function getFeaturedProducts() {
  const data = await prisma.product.findMany({
    where: { isFeatured: true },
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  return convertToPlainObject(data);
}

// Category
// Get all categories
export async function getAllCategories() {
  return await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true },
      },
    },
  });
}

// Utils
export async function deleteImages(imgIds: string[]) {
  const utapi = new UTApi();

  return utapi.deleteFiles(imgIds);
}
