/**
 * เข้าสู่ระบบ. Inline error strip above the form, never a floating toast.
 * Sprint 2.
 */

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { postLogin } from "@/api/auth.api";

function LoginPage({ className, ...props }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const setAuth = useAuthStore((state) => state.setAuth);

  const hdlLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const { token, user } = await postLogin(formData);

      // No navigate() here: setting the token swaps guestRouter → userRouter
      // in routes/index.jsx, which lands on the dashboard on its own.
      setAuth({ token, user });
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      // Must be in `finally` — leaving it at the end of the try means a failed
      // login disables the submit button until the page is reloaded.
      setIsLoading(false);
    }
  };

  const hdlOnChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
        </CardHeader>

        <CardContent>
          <form className="flex flex-col gap-2" onSubmit={hdlLogin}>
            {errorMessage && (
              <p
                role="alert"
                className="mb-4 rounded-[6px] border border-destructive/30 bg-destructive/10 px-3 py-2 text-left text-[13px] text-destructive"
              >
                {errorMessage}
              </p>
            )}

            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={formData.email}
                  onChange={hdlOnChange}
                />
              </Field>

              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                </div>

                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={hdlOnChange}
                />
              </Field>

              <Field>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Logging in…" : "Login"}
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
