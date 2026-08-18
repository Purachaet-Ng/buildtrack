/**
 * ลงทะเบียน. No role picker — role is assigned by an admin. Duplicate email is
 * an inline field error under the email input, not the strip at the top.
 *
 * react-hook-form owns the values, validation and submit state.
 * registerFormSchema is the only validator, hence noValidate on the form: the
 * browser's own constraint checks would block submit before hdlSubmit runs.
 * Sprint 2.
 */

import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { postRegister } from "@/api/auth.api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerFormSchema } from "@/validators/auth.validator";
import { toast } from "sonner";

function RegisterPage({ ...props }) {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit: hdlSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      firstname: "",
      lastname: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const hdlRegister = async (values) => {
    // The password pair is checked by the schema; the backend never receives
    // confirmPassword.
    const { confirmPassword: _confirmPassword, ...body } = values;

    try {
      await postRegister(body);
      // The toast confirms the action itself; the `registered` flag drives the
      // banner on the login page telling them what to do next. `replace` so
      // Back does not return to a filled-in form for an account that exists.
      toast.success("Register Successful", {
        description: "Taking you to login page",
      });
      navigate("/", { replace: true, state: { registered: true } });
    } catch (error) {
      // A duplicate email is a 409 and belongs under the email input.
      if (error.status === 409) {
        setError("email", { message: error.message });
        return;
      }
      setError("root", { message: error.message });
    }
  };

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form noValidate onSubmit={hdlSubmit(hdlRegister)}>
          {errors.root && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle />
              <AlertDescription>{errors.root.message}</AlertDescription>
            </Alert>
          )}

          <FieldGroup>
            <div className="flex flex-row justify-between  gap-2 ">
              <Field className="flex-1" data-invalid={!!errors.firstname}>
                <FieldLabel htmlFor="firstname">Firstname</FieldLabel>
                <Input
                  id="firstname"
                  type="text"
                  placeholder="John"
                  aria-invalid={!!errors.firstname}
                  {...register("firstname")}
                />
                <FieldError
                  errors={errors.firstname ? [errors.firstname] : undefined}
                />
              </Field>
              <Field className="flex-1" data-invalid={!!errors.lastname}>
                <FieldLabel htmlFor="lastname">Lastname</FieldLabel>
                <Input
                  id="lastname"
                  type="text"
                  placeholder="Doe"
                  aria-invalid={!!errors.lastname}
                  {...register("lastname")}
                />
                <FieldError
                  errors={errors.lastname ? [errors.lastname] : undefined}
                />
              </Field>
            </div>

            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                aria-invalid={!!errors.email}
                {...register("email")}
              />
              <FieldError errors={errors.email ? [errors.email] : undefined} />
            </Field>

            <Field data-invalid={!!errors.phone}>
              <FieldLabel htmlFor="phone">Phone number (optional)</FieldLabel>
              <Input
                id="phone"
                type="tel"
                placeholder="08X-XXX-XXXX"
                aria-invalid={!!errors.phone}
                {...register("phone")}
              />
              <FieldError errors={errors.phone ? [errors.phone] : undefined} />
            </Field>

            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
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

            <Field data-invalid={!!errors.confirmPassword}>
              <FieldLabel htmlFor="confirmPassword">
                Confirm Password
              </FieldLabel>
              <Input
                id="confirmPassword"
                type="password"
                aria-invalid={!!errors.confirmPassword}
                {...register("confirmPassword")}
              />
              <FieldError
                errors={
                  errors.confirmPassword ? [errors.confirmPassword] : undefined
                }
              />
            </Field>

            <FieldGroup>
              <Field>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating account…" : "Create Account"}
                </Button>

                {/* <Button variant="outline" type="button">
                  Sign up with Google
                </Button> */}

                <FieldDescription className="px-6 text-center">
                  Already have an account? <Link to="/">Sign in</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}

export default RegisterPage;
