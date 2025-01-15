import { Button } from "@/components/ui/button";
import { useFormStatus } from "react-dom";

const SignInButton = () => {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full" variant={"default"} disabled={pending}>
      {pending ? "Signing In..." : "Sign In"}
    </Button>
  );
};

export default SignInButton;
