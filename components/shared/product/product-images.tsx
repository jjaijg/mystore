"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";

type Props = {
  images: string[];
};

const ProductImages = ({ images }: Props) => {
  const [currentImgId, setCurrentImgId] = useState(0);

  return (
    <div className="space-y-4">
      <Image
        src={images[currentImgId]}
        alt={`Product image`}
        width={1000}
        height={1000}
        priority
        className="min-h-[300px] object-cover object-center"
      />
      <div className="flex">
        {images.map((img, idx) => (
          <div
            key={img}
            onClick={() => setCurrentImgId(idx)}
            className={cn(
              "border mr-2 cursor-pointer hover:border-orange-600",
              currentImgId === idx && "border-orange-500"
            )}
          >
            <Image
              src={img}
              alt="Product image"
              width={100}
              height={100}
              priority
              className="w-auto"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductImages;
