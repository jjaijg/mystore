import { z } from "zod";
import { currencyValidation } from ".";

const validateVariantStock = (data: {
  stock?: number;
  productVariants?: { stock: number }[];
}) => {
  if (!data.productVariants || data.productVariants.length === 0 || !data.stock)
    return true;
  const totalVariantStock = data.productVariants.reduce(
    (sum, v) => sum + v.stock,
    0
  );
  return totalVariantStock <= data.stock;
};

// Define the Product Variant Schema
const productVariantSchema = z.object({
  type: z.enum(["weight", "volume", "size"], {
    required_error: "Variant type is required",
  }),
  value: z.string().min(1, "Variant value is required"),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  stock: z.coerce.number().min(0, "Stock must be a positive number"),
  discountPercent: z.coerce
    .number()
    .min(0, "Discount % should be between 0 to 100")
    .max(100, "Discount % should be between 0 to 100")
    .optional(),
});

// Base product schema
export const baseProductSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters"),
  categoryId: z.string().min(3, "Category must be at least 3 characters"),
  brandId: z.string().optional(),
  description: z.string().min(3, "Description must be at least 3 characters"),
  stock: z.coerce.number(),
  images: z.array(z.string()).min(1, "Product must have at least one image"),
  isFeatured: z.boolean(),
  banner: z.string().nullable(),
  price: currencyValidation,
  discountPercent: z.coerce
    .number()
    .min(0, "Discount % should be between 0 to 100")
    .max(100, "Discount % should be between 0 to 100")
    .optional(),
  productVariants: z.array(productVariantSchema).optional(),
});

// Insert product schema
export const insertProductSchema = baseProductSchema.refine(
  validateVariantStock,
  {
    message: "Sum of variant stocks cannot exceed total product stock",
    path: ["productVariants"],
  }
);

// update product schema
export const updateProductSchema = baseProductSchema
  .extend({
    id: z.string().min(1, "Id is required"),
  })
  .refine(validateVariantStock, {
    message: "Sum of variant stocks cannot exceed total product stock",
    path: ["productVariants"],
  });

export type InserProductSchema = z.infer<typeof insertProductSchema>;
