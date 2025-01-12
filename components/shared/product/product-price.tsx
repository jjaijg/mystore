import { cn } from "@/lib/utils";

type Props = {
  value: number;
  classname?: string;
};

const ProductPrice = ({ value, classname }: Props) => {
  const strVal = value.toFixed(2);
  const [intVal, floatVal] = strVal.split(".");

  return (
    <p className={cn("text-2xl", classname)}>
      <span className="text-xs align-super">₹</span>
      {intVal}
      <span className="text-xs align-super">.{floatVal}</span>
    </p>
  );
};

export default ProductPrice;
