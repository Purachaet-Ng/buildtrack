/**
 * The project form, shared by AddProject (POST) and EditProject (PATCH). Owns
 * the dialog chrome, the seven fields, react-hook-form, and the mapping of
 * server errors back onto fields. Callers supply the schema, the starting
 * values, and what to do with the submitted values.
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
import { Calendar } from "@/components/ui/calendar";
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
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCompanies } from "@/hooks/useCompany";
import { usePermission } from "@/hooks/usePermission";
import { PROJECT_STATUS_META } from "@/lib/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { AlertCircle, CalendarIcon } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

/** The form's field names — also the set of server error fields it can show. */
const FORM_FIELDS = new Set([
  "name",
  "location",
  "description",
  "clientCompanyId",
  "startDate",
  "endDate",
  "budget",
  "status",
]);

/**
 * @param trigger        optional element rendered as DialogTrigger; omit when
 *                       the caller drives `open` itself (a DropdownMenuItem
 *                       cannot be a trigger — the menu unmounts on close).
 * @param onSubmit       async (values) => void. Throw to surface an error; the
 *                       dialog maps `error.errors` onto fields.
 * @param requireDirty   disable submit until something changes. PATCH uses this
 *                       so an untouched form cannot fire a no-op request.
 */
export function ProjectFormDialog({
  open,
  onOpenChange,
  schema,
  defaultValues,
  onSubmit,
  title,
  description,
  submitLabel,
  pendingLabel,
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
    setValue,
    reset,
    watch,
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

  // The range picker reads and writes form state directly. Holding the range in
  // its own useState as well would give two sources of truth that drift the
  // moment reset() runs.
  const startDate = watch("startDate");
  const endDate = watch("endDate");
  const range = startDate ? { from: startDate, to: endDate } : undefined;

  const hdlSelectRange = (picked) => {
    // shouldDirty matters: setValue does NOT mark a field dirty by default, so
    // without it a date-range change alone would leave isDirty false and keep
    // Edit's submit button disabled.
    const options = { shouldValidate: true, shouldDirty: true };
    setValue("startDate", picked?.from, options);
    setValue("endDate", picked?.to, options);
  };

  const hdlSubmitValues = async (values) => {
    try {
      await onSubmit(values);
    } catch (error) {
      // The validate middleware sends errors: [{ field, message }]; client.js
      // flattens it onto error.errors. Anything without a field we render — a
      // 403 from requireRole, a 404, a dead server — belongs in the banner.
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

      {/*
        DialogContent ships with no max-height — it is centred on `top-50%` with
        a -50% translate, so a form taller than the viewport overflows off BOTH
        edges and neither the title nor the footer can be reached. Capping the
        height here and giving the fields their own scroll region keeps the
        header and the footer pinned.

        The cap is min(90vh, 90svh) and needs both units. svh alone is the
        mobile answer — it accounts for the collapsing browser toolbar — but the
        UA fixes it at load and does not recompute it when the window resizes,
        so on a shrunk desktop window it stays too large and the dialog spills
        again. vh tracks the resize but ignores the toolbar. The smaller of the
        two is right in both cases.

        p-0 + gap-0 move the padding onto the three sections, so the scrollbar
        sits against the dialog edge instead of floating inside the padding.
        The min-h-0s are load-bearing: a flex child defaults to min-height:auto
        and refuses to shrink below its content, which silently disables the
        overflow.
      */}
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
              <Field data-invalid={!!errors.name}>
                <FieldLabel htmlFor="project-name">Name</FieldLabel>
                <Input
                  id="project-name"
                  type="text"
                  placeholder="Bangkok Condominium"
                  aria-invalid={!!errors.name}
                  {...register("name")}
                />
                <FieldError errors={errors.name ? [errors.name] : undefined} />
              </Field>

              <Field data-invalid={!!errors.clientCompanyId}>
                <FieldLabel htmlFor="project-client">Client</FieldLabel>
                <Controller
                  control={control}
                  name="clientCompanyId"
                  render={({ field }) => (
                    <Select
                      // "" and not undefined for the empty case: Radix reads an
                      // undefined value as "uncontrolled" and keeps whatever was
                      // last picked, so reset() would leave a stale company on
                      // screen. "" matches no item, which shows the placeholder.
                      // The string cast is required either way — Radix rejects a
                      // number, and the schema's z.coerce.number() converts back.
                      value={field.value ? String(field.value) : ""}
                      onValueChange={field.onChange}
                      disabled={isLoadingCompanies}
                    >
                      <SelectTrigger
                        id="project-client"
                        className="w-full"
                        aria-invalid={!!errors.clientCompanyId}
                      >
                        <SelectValue
                          placeholder={
                            isLoadingCompanies
                              ? "Loading companies…"
                              : "Select a client company"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
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
                <FieldError
                  errors={
                    errors.clientCompanyId
                      ? [errors.clientCompanyId]
                      : undefined
                  }
                />
              </Field>

              <Field data-invalid={!!errors.location}>
                <FieldLabel htmlFor="project-location">
                  Location (optional)
                </FieldLabel>
                <Input
                  id="project-location"
                  type="text"
                  placeholder="Sukhumvit 71, Bangkok"
                  aria-invalid={!!errors.location}
                  {...register("location")}
                />
                <FieldError
                  errors={errors.location ? [errors.location] : undefined}
                />
              </Field>

              <Field data-invalid={!!errors.description}>
                <FieldLabel htmlFor="project-description">
                  Description (optional)
                </FieldLabel>
                <Textarea
                  id="project-description"
                  aria-invalid={!!errors.description}
                  {...register("description")}
                />
                <FieldError
                  errors={errors.description ? [errors.description] : undefined}
                />
              </Field>

              <Field data-invalid={!!errors.startDate || !!errors.endDate}>
                <FieldLabel htmlFor="project-period">Project Period</FieldLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      id="project-period"
                      aria-invalid={!!errors.startDate || !!errors.endDate}
                      className="justify-start px-2.5 font-normal"
                    >
                      <CalendarIcon data-icon="inline-start" />
                      {range?.from ? (
                        range.to ? (
                          <>
                            {format(range.from, "d MMM yyyy")} –{" "}
                            {format(range.to, "d MMM yyyy")}
                          </>
                        ) : (
                          format(range.from, "d MMM yyyy")
                        )
                      ) : (
                        <span className="text-muted-foreground">
                          Pick a start and end date
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      defaultMonth={range?.from}
                      selected={range}
                      onSelect={hdlSelectRange}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
                <FieldError
                  errors={
                    errors.startDate
                      ? [errors.startDate]
                      : errors.endDate
                        ? [errors.endDate]
                        : undefined
                  }
                />
              </Field>

              {/* Two short controls share a row — the pair costs one field's
                height instead of two, which is most of what pushed the footer
                off screen. Stacks again below sm:. */}
              <div className="grid gap-5 sm:grid-cols-2">
                <Field data-invalid={!!errors.budget}>
                  <FieldLabel htmlFor="project-budget">Budget (THB)</FieldLabel>
                  {/* type="text", never type="number": money is a Decimal(14,2)
                    and a number input hands back an already-rounded float. */}
                  <Input
                    id="project-budget"
                    type="text"
                    inputMode="decimal"
                    placeholder="25000000.00"
                    aria-invalid={!!errors.budget}
                    {...register("budget")}
                  />
                  <FieldError
                    errors={errors.budget ? [errors.budget] : undefined}
                  />
                </Field>

                <Field data-invalid={!!errors.status}>
                  <FieldLabel htmlFor="project-status">Status</FieldLabel>
                  <Controller
                    control={control}
                    name="status"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          id="project-status"
                          className="w-full"
                          aria-invalid={!!errors.status}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(PROJECT_STATUS_META).map(
                            ([value, meta]) => (
                              <SelectItem key={value} value={value}>
                                {meta.label}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FieldError
                    errors={errors.status ? [errors.status] : undefined}
                  />
                </Field>
              </div>
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
