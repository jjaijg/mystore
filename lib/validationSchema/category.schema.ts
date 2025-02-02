import { z } from "zod";

// insert category
export const insertCategorySchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters"),
});

export type CategorySchema = z.infer<typeof insertCategorySchema>;
