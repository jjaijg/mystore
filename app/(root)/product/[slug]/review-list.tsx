"use client";

import { Review } from "@/types";
import Link from "next/link";
import { useEffect, useState } from "react";
import ReviewForm from "./review-form";
import { getReviews } from "@/lib/actions/review.actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, User } from "lucide-react";
import { formatDateTiem } from "@/lib/utils";
import Rating from "@/components/shared/product/rating";

type Props = {
  userId: string;
  productId: string;
  productSlug: string;
};

const ReviewList = ({ userId, productId, productSlug }: Props) => {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const loadReviews = async () => {
      const res = await getReviews({ productId });
      setReviews(res.data);
    };

    loadReviews();
  }, [productId]);

  //   Reload the reviews after either created/updated
  const reload = async () => {
    const res = await getReviews({ productId });
    setReviews(res.data);
  };

  return (
    <>
      <div className="space-y-4">
        {reviews.length === 0 && <div>No reviews yet</div>}
        {userId ? (
          <>
            {/* Review Form here */}
            <ReviewForm
              userId={userId}
              productId={productId}
              onReviewSubmitted={reload}
            />
          </>
        ) : (
          <div>
            Please
            <Link
              className="text-blue-700 px-2"
              href={`/sign-in?callbackUrl=/product/${productSlug}`}
            >
              sign in
            </Link>
            to write a review
          </div>
        )}
        <div className="flex flex-col gap-3">
          {/* Reviews here */}

          {reviews.map((rev) => (
            <Card key={rev.id}>
              <CardHeader>
                <div className="flex-between">
                  <CardTitle>{rev.title}</CardTitle>
                </div>
                <CardDescription>{rev.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4 text-sm text-muted-foreground">
                  {/* RATING */}
                  <Rating value={rev.rating} />
                  <div className="flex items-center">
                    <User className="mr-1 h-3 w-3" />
                    {rev.user ? rev.user.name : "User"}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="mr-1 h-3 w-3" />
                    {formatDateTiem(rev.createdAt).dateTime}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
};

export default ReviewList;
