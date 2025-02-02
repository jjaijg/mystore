import ProductCard from "@/components/shared/product/product-card";
import { Button } from "@/components/ui/button";
import {
  getAllCategories,
  getAllProducts,
} from "@/lib/actions/product.actions";
import Link from "next/link";

const prices = [
  { name: "₹1-₹100", value: "1-100" },
  { name: "₹100-500", value: "101-500" },
  { name: "₹500-₹1000", value: "500-1000" },
  { name: "₹1000-₹2000", value: "1000-2000" },
  { name: "₹2000-₹5000", value: "2000-5000" },
];

const ratings = [4, 3, 2, 1];
const sortOrders = ["newest", "lowest", "highest", "rating"];

export async function generateMetadata(props: Props) {
  const {
    q = "all",
    category = "all",
    price = "all",
    rating = "all",
  } = await props.searchParams;

  const isQuerySet = q && q !== "all" && q.trim() !== "";
  const isCategorySet =
    category && category !== "all" && category.trim() !== "";
  const isPriceSet = price && price !== "all" && price.trim() !== "";
  const isRatingSet = rating && rating !== "all" && rating.trim() !== "";

  if (isQuerySet || isCategorySet || isPriceSet || isRatingSet) {
    return {
      title: `Search ${isQuerySet ? q : ""} 
      ${isCategorySet ? `: Category ${category}` : ""}
      ${isPriceSet ? `: Price ${price}` : ""}
      ${isRatingSet ? `: Rating ${rating}` : ""}
      `,
    };
  } else {
    return {
      title: "Search Products",
    };
  }
}

type Props = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    price?: string;
    rating?: string;
    sort?: string;
    page?: string;
  }>;
};

const SearchPage = async ({ searchParams }: Props) => {
  const {
    q = "all",
    category = "all",
    price = "all",
    rating = "all",
    sort = "newest",
    page = "1",
  } = await searchParams;

  //   Contruct filter url
  const getFilterUrl = ({
    c,
    s,
    p,
    r,
    pg,
  }: {
    c?: string;
    p?: string;
    r?: string;
    s?: string;
    pg?: string;
  }) => {
    const params = { q, category, price, rating, sort, page };
    if (c) params.category = c;
    if (p) params.price = p;
    if (r) params.rating = r;
    if (s) params.sort = s;
    if (pg) params.page = pg;
    return `/search?${new URLSearchParams(params).toString()}`;
  };

  const products = await getAllProducts({
    query: q,
    category,
    price,
    rating,
    sort,
    page: Number(page),
  });
  const categories = await getAllCategories();
  return (
    <>
      <div className="grid md:grid-cols-5 md:gap-5">
        <div className="filter-links">
          {/* Filters */}
          {/* Category link */}
          <div className="text-xl mb-2 mt-3">Category</div>
          <div>
            <ul className="space-y-1">
              <li>
                <Link
                  className={`${
                    (category === "all" || category === "") && "font-bold"
                  }`}
                  href={getFilterUrl({ c: "all" })}
                >
                  Any
                </Link>
              </li>
              {categories.map((cat) => (
                <li key={cat.name}>
                  <Link
                    className={`${category === cat.name && "font-bold"}`}
                    href={getFilterUrl({ c: cat.name })}
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {/* Price link */}
          <div className="text-xl mb-2 mt-8">Price</div>
          <div>
            <ul className="space-y-1">
              <li>
                <Link
                  className={`${price === "all" && "font-bold"}`}
                  href={getFilterUrl({ p: "all" })}
                >
                  Any
                </Link>
              </li>
              {prices.map((p) => (
                <li key={p.value}>
                  <Link
                    className={`${price === p.value && "font-bold"}`}
                    href={getFilterUrl({ p: p.value })}
                  >
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {/* Rating Link */}
          <div className="text-xl mb-2 mt-8">Customer Ratings</div>
          <div>
            <ul className="space-y-1">
              <li>
                <Link
                  className={`${rating === "all" && "font-bold"}`}
                  href={getFilterUrl({ r: "all" })}
                >
                  Any
                </Link>
              </li>
              {ratings.map((item) => (
                <li key={item}>
                  <Link
                    className={`${rating === item.toString() && "font-bold"}`}
                    href={getFilterUrl({ r: item.toString() })}
                  >
                    {`${item} stars & up`}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="space-y-4 md:col-span-4">
          <div className="flex-between flex-col my-4 md:flex-row">
            <div className="flex items-center">
              {q !== "all" && q !== "" && `Search for : ${q}`}
              {category !== "all" &&
                category !== "" &&
                ` Category : ${category}`}
              {price !== "all" && ` Price : ${price}`}
              {rating !== "all" && ` Rating : ${rating} stars & up`}
              &nbsp;
              {(q !== "all" && q !== "") ||
              (category !== "all" && category !== "") ||
              rating !== "all" ||
              price !== "all" ? (
                <Button variant={"link"} asChild>
                  <Link href={"/search"}>Clear</Link>
                </Button>
              ) : null}
            </div>
            <div>
              {/* Sorting */}
              Sort by{" "}
              {sortOrders.map((s) => (
                <Link
                  key={s}
                  href={getFilterUrl({ s })}
                  className={`mx-2 ${sort === s && "font-bold"}`}
                >
                  {s}
                </Link>
              ))}
            </div>
          </div>
          <div className="grid gric-cols-1 gap-4 md:grid-cols-3">
            {products.data.length === 0 && <div>No Products found</div>}
            {products.data.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchPage;
