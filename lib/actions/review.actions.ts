"use server";

import { z } from "zod";
import { insertReviewSchema } from "../validationSchema/review.schema";
import { formatError } from "../utils";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { revalidatePath } from "next/cache";

type Review = z.infer<typeof insertReviewSchema>;

// Create or update review
export async function createOrUpdateReview(data: Review) {
  try {
    const session = await auth();

    if (!session) throw new Error("User is not authenticated");

    // Validate & store the review
    const review = insertReviewSchema.parse({
      ...data,
      userId: session.user.id,
    });

    // Get product being reviewed
    const prod = await prisma.product.findFirst({
      where: { id: review.productId },
    });

    if (!prod) throw new Error("Product not found");

    // Check if user already review it
    const reviewExists = await prisma.review.findFirst({
      where: { productId: review.productId, userId: review.userId },
    });

    // Crreate transaction to add/update review & update average review rating of prod
    await prisma.$transaction(async (tx) => {
      if (reviewExists) {
        // update review
        await tx.review.update({
          where: { id: reviewExists.id },
          data: {
            title: review.title,
            description: review.description,
            rating: review.rating,
          },
        });
      } else {
        // Create review
        await tx.review.create({
          data: review,
        });
      }

      //   Get the average rating
      const avgRating = await tx.review.aggregate({
        _avg: { rating: true },
        where: { productId: review.productId },
      });

      // Get number of reviews
      const numReviews = await tx.review.count({
        where: { productId: review.productId },
      });

      //   Update the rating & numReviews in prod
      await tx.product.update({
        where: { id: review.productId },
        data: {
          rating: avgRating._avg.rating || 0,
          numReviews,
        },
      });
    });

    revalidatePath(`/product/${prod.slug}`);

    return { success: true, message: "Review updated successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// get all reviews for a product
export async function getReviews({ productId }: { productId: string }) {
  const data = await prisma.review.findMany({
    where: { productId },
    include: {
      user: {
        select: { name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return { data };
}

// Get a reviw by current user
export async function getAProdReviewByUser({
  productId,
}: {
  productId: string;
}) {
  const session = await auth();

  if (!session) throw new Error("User is not authorized");

  return await prisma.review.findFirst({
    where: { productId, userId: session.user.id },
  });
}
