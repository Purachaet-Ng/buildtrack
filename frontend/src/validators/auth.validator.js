import { z } from "zod";

const phoneRegex = /^(?:\+66|0)[689]\d{2}[- ]?\d{3}[- ]?\d{3}$/;

const name = (field) =>
  z
    .string({ error: `${field} is required` })
    .trim()
    .min(1, `${field} must not be empty`);

const email = z.email("Invalid email format").toLowerCase();

const password = z
  .string({ error: "password is required" })
  .min(8, "password must be at least 8 characters");

// Optional, matching the backend's `.nullish()`. An untouched input hands us
// "" and the regex would reject it as malformed, so empty becomes undefined —
// "not provided" rather than "provided and wrong".
const phone = z.preprocess(
  (val) => (val === "" ? undefined : val),
  z
    .string()
    .trim()
    .regex(phoneRegex, "Invalid phone number format")
    .transform((val) => val.replace(/[- ]/g, ""))
    .nullish(),
);

const authBody = z.object({
  firstname: name("firstname"),
  lastname: name("lastname"),
  email,
  password,
  phone,
});

// The body POST /auth/register actually receives.
export const registerSchema = authBody;

// What the register FORM validates: the body plus the confirmation field the
// backend never sees. Kept separate so nothing can accidentally send
// confirmPassword upstream.
export const registerFormSchema = authBody
  .extend({
    confirmPassword: z.string({ error: "please confirm your password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Login does not re-enforce the registration password policy: the 8-character
// minimum is a rule for *choosing* a password, and applying it here would
// reject a valid short legacy password before the server ever sees it.
export const loginSchema = z.object({
  email,
  password: z
    .string({ error: "password is required" })
    .min(1, "password is required"),
});
