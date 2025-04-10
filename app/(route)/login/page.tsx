import { LoginForm } from "@/components/auth/login-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";

export default async function LoginPage({
  searchParams = {},
}: {
  readonly searchParams: { readonly [key: string]: string | string[] | undefined };
}) {
  const { registered = "false" } = searchParams;
  const isRegistered = registered === "true";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      {isRegistered && (
        <div className="w-full max-w-md mb-4">
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <AlertDescription>
              Registration successful! Please check your email to confirm your account.
            </AlertDescription>
          </Alert>
        </div>
      )}
      <LoginForm />
    </div>
  );
}
