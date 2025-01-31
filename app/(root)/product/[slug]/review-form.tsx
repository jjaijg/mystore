"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  createOrUpdateReview,
  getAProdReviewByUser,
} from "@/lib/actions/review.actions";
import { reviewFormDefaults } from "@/lib/constants";
import { insertReviewSchema } from "@/lib/validationSchema/review.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { StarIcon } from "lucide-react";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

type Props = {
  userId: string;
  productId: string;
  onReviewSubmitted: () => void;
};

type ReviewSchema = z.infer<typeof insertReviewSchema>;

const ReviewForm = ({ userId, productId, onReviewSubmitted }: Props) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<ReviewSchema>({
    resolver: zodResolver(insertReviewSchema),
    defaultValues: reviewFormDefaults,
  });

  // Open form handler
  const handleOpenForm = async () => {
    form.setValue("productId", productId);
    form.setValue("userId", userId);

    const review = await getAProdReviewByUser({ productId });

    if (review) {
      form.setValue("title", review.title);
      form.setValue("description", review.description);
      form.setValue("rating", review.rating);
    }
    setOpen(true);
  };

  const onSubmit: SubmitHandler<ReviewSchema> = async (data) => {
    const res = await createOrUpdateReview({ ...data });

    toast({
      variant: res.success ? "default" : "destructive",
      description: res.message,
    });

    if (!res.success) return;

    setOpen(false);
    onReviewSubmitted();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <Button onClick={handleOpenForm} variant={"default"}>
          Write a review
        </Button>
        <DialogContent className="sm:max-w-[425px]">
          <Form {...form}>
            <form method="post" onSubmit={form.handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle>Write a review</DialogTitle>
                <DialogDescription>
                  Share your thoughts with other customers
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap4 py-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter title" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter description" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel>Rating</FormLabel>
                        <Select
                          {...field}
                          defaultValue={
                            !field.value ? undefined : field.value.toString()
                          }
                          value={
                            !field.value ? undefined : field.value.toString()
                          }
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a rating" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.from({ length: 5 }).map((_, idx) => (
                              <SelectItem
                                key={idx}
                                value={(idx + 1).toString()}
                              >
                                {idx + 1}{" "}
                                <StarIcon className="inline h-4 w-4" />
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    );
                  }}
                />
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  size={"lg"}
                  className="w-full"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? "Submitting..." : "Submit"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ReviewForm;
