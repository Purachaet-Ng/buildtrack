/**
 * เข้าสู่ระบบ. Success is a toast; failures and the post-register notice are
 * inline alerts above the form, where they stay put next to the inputs.
 *
 * react-hook-form owns the values, validation and submit state. loginSchema is
 * the only validator, hence noValidate on the form: the browser's own
 * constraint checks would block submit before handleSubmit runs.
 * Sprint 2.
 */

import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { postLogin } from "@/api/auth.api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/validators/auth.validator";
import { toast } from "sonner";

function LoginPage({ className, ...props }) {
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();
  const { state } = useLocation();

  // Captured once on mount: the effect below strips the flag off the history
  // entry, and this banner has to outlive that.
  const [showRegistered] = useState(() => !!state?.registered);

  useEffect(() => {
    if (state?.registered) {
      navigate("/", { replace: true, state: null });
    }
  }, [state, navigate]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const hdlLogin = async (values) => {
    try {
      const { token, user } = await postLogin(values);

      // No delay needed before setAuth: it swaps the router tree in the same
      // commit and unmounts this page, but the Toaster lives outside
      // RouterProvider so the toast rides through the swap.
      toast.success("Signed in", {
        description: "Taking you to your dashboard",
      });
      setAuth({ token, user });
    } catch (error) {
      setError("root", { message: error.message });
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
        </CardHeader>

        <CardContent>
          <form
            noValidate
            className="flex flex-col gap-2"
            onSubmit={handleSubmit(hdlLogin)}
          >
            {/* Dropped once an attempt fails — "Account created" stacked above
                "Invalid credentials" reads as a contradiction. */}
            {showRegistered && !errors.root && (
              <Alert variant="success" className="mb-4">
                <CheckCircle2 />
                <AlertTitle>Account created</AlertTitle>
                <AlertDescription>
                  Please sign in with your new account.
                </AlertDescription>
              </Alert>
            )}

            {errors.root && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle />
                <AlertDescription>{errors.root.message}</AlertDescription>
              </Alert>
            )}

            <FieldGroup>
              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  aria-invalid={!!errors.email}
                  {...register("email")}
                />
                <FieldError
                  errors={errors.email ? [errors.email] : undefined}
                />
              </Field>

              <Field data-invalid={!!errors.password}>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                </div>

                <Input
                  id="password"
                  type="password"
                  aria-invalid={!!errors.password}
                  {...register("password")}
                />
                <FieldError
                  errors={errors.password ? [errors.password] : undefined}
                />
              </Field>

              <Field>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Logging in…" : "Login"}
                </Button>

                <FieldDescription className="text-center">
                  Don&apos;t have an account?{" "}
                  <Link to="/register">Sign up</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default LoginPage;
