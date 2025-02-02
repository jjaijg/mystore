import { z } from "zod";
import { currencyValidation } from ".";

// Inserting product schema
export const insertProductSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters"),
  categoryId: z.string().min(3, "Category must be at least 3 characters"),
  brandId: z.string().min(3, "Brand must be at least 3 characters"),
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
    .nullable(),
});

// update product schema
export const updateProductSchema = insertProductSchema.extend({
  id: z.string().min(1, "Id is required"),
});

export type InserProductSchema = z.infer<typeof insertProductSchema>;
