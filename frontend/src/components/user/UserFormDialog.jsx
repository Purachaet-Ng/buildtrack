/**
 * The user form, shared by AddUser (POST) and EditUser (PATCH). Owns the dialog
 * chrome, the seven fields, react-hook-form, and the mapping of server errors
 * back onto fields. Callers supply the schema, the starting values, and what to
 * do with the submitted values.
 *
 * The form lives INSIDE DialogContent, not around <Dialog>. DialogContent
 * renders through a portal, so a <form> wrapped around the dialog ends up with
 * none of its inputs and no submit button in the DOM — the submit event never
 * fires.
 *
 * The zod schema is the only validator, hence noValidate: the browser's own
 * constraint checks would block submit before the resolver runs.
 */

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCompanies } from "@/hooks/useCompany";
import { usePermission } from "@/hooks/usePermission";
import { ROLE_META } from "@/lib/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

/** The form's field names — also the set of server error fields it can show. */
const FORM_FIELDS = new Set([
  "firstname",
  "lastname",
  "email",
  "password",
  "role",
  "phone",
  "companyId",
]);

/**
 * Radix Select refuses an item with value="", so "no company" needs a sentinel.
 * It is translated back to null on the way into the schema.
 */
export const NO_COMPANY = "NONE";

/**
 * @param trigger        optional element rendered as DialogTrigger; omit when
 *                       the caller drives `open` itself (a DropdownMenuItem
 *                       cannot be a trigger — the menu unmounts on close).
 * @param onSubmit       async (values) => void. Throw to surface an error; the
 *                       dialog maps `error.errors` onto fields.
 * @param requireDirty   disable submit until something changes. PATCH uses this
 *                       so an untouched form cannot fire a no-op request.
 * @param passwordHint   rendered under the password field; Edit uses it to say
 *                       that a blank leaves the current password alone.
 */
export function UserFormDialog({
  open,
  onOpenChange,
  schema,
  defaultValues,
  onSubmit,
  title,
  description,
  submitLabel,
  pendingLabel,
  passwordHint,
  requireDirty = false,
  trigger,
}) {
  const { can } = usePermission();

  // Only fetched while the dialog is open, and only for the roles GET
  // /companies allows — STAFF and CLIENT get a 403 from it.
  const { data: companies, isLoading: isLoadingCompanies } = useCompanies({
    enabled: open && can("company:view"),
  });
  const companyOptions = companies?.data ?? [];

  const {
    control,
    register,
    handleSubmit: hdlSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  // Edit seeds its values from a table row, and the same dialog instance is
  // reused for whichever row is open. Re-seeding on open keeps a stale row's
  // values from showing for a moment, and clears a cancelled draft.
  useEffect(() => {
    if (open) reset(defaultValues);
    // defaultValues is rebuilt each render by the caller; keying the effect on
    // `open` alone is what makes this "re-seed on open" rather than a loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, reset]);

  const hdlSubmitValues = async (values) => {
    try {
      await onSubmit(values);
    } catch (error) {
      // The validate middleware sends errors: [{ field, message }]; client.js
      // flattens it onto error.errors. Anything without a field we render — a
      // 403 from requireRole, a 409 on a duplicate email, a dead server —
      // belongs in the banner.
      const named = (error.errors ?? []).filter((issue) =>
        FORM_FIELDS.has(issue.field),
      );

      for (const issue of named) {
        setError(issue.field, { message: issue.message });
      }
      if (named.length === 0) {
        setError("root", { message: error.message });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger}

      {/* Same height cap as ProjectFormDialog — see the note there for why both
          vh and svh are needed. */}
      <DialogContent className="flex max-h-[min(90vh,90svh)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="border-b px-6 pt-6 pb-4">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form
          noValidate
          onSubmit={hdlSubmit(hdlSubmitValues)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            {errors.root && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle />
                <AlertDescription>{errors.root.message}</AlertDescription>
              </Alert>
            )}

            {/* gap-5, not FieldGroup's default gap-7: UI-PROMPT.md PROMPT 0
                puts form field gap at 20px. */}
            <FieldGroup className="gap-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field data-invalid={!!errors.firstname}>
                  <FieldLabel htmlFor="user-firstname">First name</FieldLabel>
                  <Input
                    id="user-firstname"
                    type="text"
                    placeholder="สมชาย"
                    aria-invalid={!!errors.firstname}
                    {...register("firstname")}
                  />
                  <FieldError
                    errors={errors.firstname ? [errors.firstname] : undefined}
                  />
                </Field>

                <Field data-invalid={!!errors.lastname}>
                  <FieldLabel htmlFor="user-lastname">Last name</FieldLabel>
                  <Input
                    id="user-lastname"
                    type="text"
                    placeholder="ใจดี"
                    aria-invalid={!!errors.lastname}
                    {...register("lastname")}
                  />
                  <FieldError
                    errors={errors.lastname ? [errors.lastname] : undefined}
                  />
                </Field>
              </div>

              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="user-email">Email</FieldLabel>
                <Input
                  id="user-email"
                  type="email"
                  placeholder="somchai@buildtrack.com"
                  aria-invalid={!!errors.email}
                  {...register("email")}
                />
                <FieldError errors={errors.email ? [errors.email] : undefined} />
              </Field>

              <Field data-invalid={!!errors.password}>
                <FieldLabel htmlFor="user-password">Password</FieldLabel>
                <Input
                  id="user-password"
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={!!errors.password}
                  {...register("password")}
                />
                {passwordHint && (
                  <FieldDescription>{passwordHint}</FieldDescription>
                )}
                <FieldError
                  errors={errors.password ? [errors.password] : undefined}
                />
              </Field>

              <Field data-invalid={!!errors.role}>
                <FieldLabel htmlFor="user-role">Role</FieldLabel>
                <Controller
                  control={control}
                  name="role"
                  render={({ field }) => (
                    <Select
                      // "" and not undefined: Radix reads undefined as
                      // "uncontrolled" and keeps whatever was last picked, so
                      // reset() would leave a stale role on screen.
                      value={field.value ?? ""}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger
                        id="user-role"
                        className="w-full"
                        aria-invalid={!!errors.role}
                      >
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(ROLE_META).map(([value, meta]) => (
                          <SelectItem key={value} value={value}>
                            {meta.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={errors.role ? [errors.role] : undefined} />
              </Field>

              <Field data-invalid={!!errors.companyId}>
                <FieldLabel htmlFor="user-company">
                  Company (optional)
                </FieldLabel>
                <Controller
                  control={control}
                  name="companyId"
                  render={({ field }) => (
                    <Select
                      value={
                        field.value === null || field.value === undefined
                          ? NO_COMPANY
                          : String(field.value)
                      }
                      onValueChange={(value) =>
                        field.onChange(value === NO_COMPANY ? null : value)
                      }
                      disabled={isLoadingCompanies}
                    >
                      <SelectTrigger
                        id="user-company"
                        className="w-full"
                        aria-invalid={!!errors.companyId}
                      >
                        <SelectValue
                          placeholder={
                            isLoadingCompanies
                              ? "Loading companies…"
                              : "No company"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NO_COMPANY}>No company</SelectItem>
                        {companyOptions.map((company) => (
                          <SelectItem
                            key={company.id}
                            value={String(company.id)}
                          >
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldDescription>
                  A CLIENT only sees the projects owned by their company.
                </FieldDescription>
                <FieldError
                  errors={errors.companyId ? [errors.companyId] : undefined}
                />
              </Field>

              <Field data-invalid={!!errors.phone}>
                <FieldLabel htmlFor="user-phone">Phone (optional)</FieldLabel>
                <Input
                  id="user-phone"
                  type="tel"
                  placeholder="081-234-5678"
                  aria-invalid={!!errors.phone}
                  {...register("phone")}
                />
                <FieldError errors={errors.phone ? [errors.phone] : undefined} />
              </Field>
            </FieldGroup>
          </div>

          <DialogFooter className="border-t px-6 py-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={isSubmitting || (requireDirty && !isDirty)}
            >
              {isSubmitting ? pendingLabel : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
