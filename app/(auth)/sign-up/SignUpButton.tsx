import { Button } from "@/components/ui/button";
import { useFormStatus } from "react-dom";

const SignUpButton = () => {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full" variant={"default"} disabled={pending}>
      {pending ? "Signing Up..." : "Sign Up"}
    </Button>
  );
};

export default SignUpButton;
