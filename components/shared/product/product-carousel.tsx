"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Product } from "@/types";
import AutoPlay from "embla-carousel-autoplay";
import Image from "next/image";
import Link from "next/link";

type Props = {
  data: Product[];
};
const ProductCarousel = ({ data }: Props) => {
  return (
    <>
      <Carousel
        className="w-full mb-12"
        opts={{
          loop: true,
        }}
        plugins={[
          AutoPlay({
            delay: 5000,
            stopOnInteraction: true,
            stopOnMouseEnter: true,
          }),
        ]}
      >
        <CarouselContent>
          {data.map((prod) => (
            <CarouselItem key={prod.id}>
              <Link href={`/product/${prod.slug}`}>
                <div className="relative mx-auto">
                  <Image
                    src={prod.banner!}
                    alt={prod.name}
                    height={0}
                    width={0}
                    sizes="100vw"
                    className="w-full h-auto"
                    priority
                  />
                  <div className="absolute inset-0 flex items-end justify-center">
                    <h2 className="bg-gray-100 bg-opacity-50 text-2xl font-bold px-2 text-white">
                      {prod.name}
                    </h2>
                  </div>
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </>
  );
};

export default ProductCarousel;
