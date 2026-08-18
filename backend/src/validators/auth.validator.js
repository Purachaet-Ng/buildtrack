import z from "zod";

const positiveId = (message) =>
  z.coerce.number({ error: message }).int(message).positive(message);

const phoneRegex = /^(?:\+66|0)[689]\d[- ]?\d{3}[- ]?\d{4}$/;

const name = (field) =>
  z
    .string({ error: `${field} is required` })
    .trim()
    .min(1, `${field} must not be empty`);

const email = z
  .string({ error: "email is required" })
  .trim()
  .email("Invalid email format")
  .toLowerCase();

const password = z
  .string({ error: "password is required" })
  .min(8, "password must be at least 8 characters");

const phone = z
  .string()
  .trim()
  .regex(phoneRegex, "Invalid phone number format")
  .transform((val) => val.replace(/[- ]/g, ""))
  .nullish();

//─────────────────────────────────────────────────────────────
// For Params
//─────────────────────────────────────────────────────────────

export const authParams = z.object({
  id: positiveId("Invalid user id"),
});

//─────────────────────────────────────────────────────────────
// For Body
//─────────────────────────────────────────────────────────────

const authBody = z.object({
  firstname: name("firstname"),
  lastname: name("lastname"),
  email,
  password,
  phone,
});

export const registerBody = authBody;

export const loginBody = authBody.pick({
  email: true,
  password: true,
});
