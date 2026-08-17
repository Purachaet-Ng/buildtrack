/**
 * ลงทะเบียน. No role picker — role is assigned by an admin. Duplicate email is an inline field error under the email input.
 * Sprint 2.
 */

import React, { useState } from "react";

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
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { Link, useNavigate } from "react-router-dom";
import { postRegister } from "@/api/auth.api";

function RegisterPage({ ...props }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  // Duplicate email comes back as a 409 and belongs under the email input,
  // not in the strip at the top.
  const [emailError, setEmailError] = useState("");

  const hdlRegister = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setEmailError("");

    // The backend never receives confirmPassword, so this pair is only ever
    // checked here.
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const { confirmPassword: _confirmPassword, ...body } = formData;
      await postRegister(body);
      navigate("/");
    } catch (error) {
      if (error.status === 409) {
        setEmailError(error.message);
      } else {
        setErrorMessage(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const hdlOnChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
        <form onSubmit={hdlRegister}>
          {errorMessage && (
            <p
              role="alert"
              className="mb-4 rounded-[6px] border border-destructive/30 bg-destructive/10 px-3 py-2 text-left text-[13px] text-destructive"
            >
              {errorMessage}
            </p>
          )}

          <FieldGroup>
            <div className="flex flex-row justify-between  gap-2 ">
              <Field className="flex-1">
                <FieldLabel htmlFor="firstname">Firstname</FieldLabel>
                <Input
                  id="firstname"
                  name="firstname"
                  type="text"
                  placeholder="John"
                  required
                  value={formData.firstname}
                  onChange={hdlOnChange}
                />
              </Field>
              <Field className="flex-1">
                <FieldLabel htmlFor="lastname">Lastname</FieldLabel>
                <Input
                  id="lastname"
                  name="lastname"
                  type="text"
                  placeholder="Doe"
                  required
                  value={formData.lastname}
                  onChange={hdlOnChange}
                />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
                aria-invalid={emailError ? true : undefined}
                value={formData.email}
                onChange={hdlOnChange}
              />
              {emailError && (
                <FieldDescription className="text-destructive">
                  {emailError}
                </FieldDescription>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="phone">Phone number</FieldLabel>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="08X-XXX-XXXX"
                required
                value={formData.phone}
                onChange={hdlOnChange}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                value={formData.password}
                onChange={hdlOnChange}
              />
              <FieldDescription>At least 8 characters.</FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="confirmPassword">
                Confirm Password
              </FieldLabel>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={hdlOnChange}
              />
            </Field>

            <FieldGroup>
              <Field>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating account…" : "Create Account"}
                </Button>

                <Button variant="outline" type="button">
                  Sign up with Google
                </Button>

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
