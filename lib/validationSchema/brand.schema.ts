import { z } from "zod";

// insert brand
export const insertBrandSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters"),
});

export type BrandSchema = z.infer<typeof insertBrandSchema>;
