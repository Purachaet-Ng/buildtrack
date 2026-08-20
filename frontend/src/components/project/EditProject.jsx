/**
 * Edit Project dialog. Opened from the row menu in ProjectsPage behind
 * `can("project:update")`: ADMIN and PM. The backend additionally 403s a PM who
 * is not a member of the project — that lands in the dialog's root alert.
 *
 * Controlled by the caller rather than owning a DialogTrigger: the trigger is a
 * DropdownMenuItem, and a dialog rendered inside DropdownMenuContent is
 * unmounted the instant the menu closes.
 */

import { ProjectFormDialog } from "@/components/project/ProjectFormDialog";
import { useUpdateProject } from "@/hooks/useProject";
import { emptyToNull } from "@/lib/utils";
import { updateProjectSchema } from "@/validators/project.validator";
import { parseISO } from "date-fns";
import { toast } from "sonner";

/**
 * The list response already carries every field the form needs, so editing a
 * row costs no extra request.
 *
 * Two conversions matter. The dates arrive as ISO strings and the Calendar
 * wants Date objects. `location` and `description` are nullable in the schema,
 * and feeding null to an <input> flips it from uncontrolled to controlled on
 * the first keystroke — React warns and the field misbehaves.
 */
const toFormValues = (project) => ({
  name: project.name ?? "",
  location: project.location ?? "",
  description: project.description ?? "",
  clientCompanyId: project.clientCompanyId ?? "",
  startDate: project.startDate ? parseISO(project.startDate) : undefined,
  endDate: project.endDate ? parseISO(project.endDate) : undefined,
  // Stays a string: it is a Decimal(14,2) and the schema parses the text form.
  budget: project.budget ?? "",
  status: project.status ?? "PLANNING",
});

export function EditProject({ project, open, onOpenChange }) {
  const updateProject = useUpdateProject();

  const hdlUpdate = async (values) => {
    // The full body, not a diff of changed fields. updateProjectSchema is
    // .partial() so a complete body is valid, and the backend re-validates
    // every field anyway. What APIs.md actually asks for — no no-op patch — is
    // handled by requireDirty on the submit button, which is far more reliable
    // than diffing react-hook-form's dirtyFields (its equality check on Date
    // objects is the part that would quietly break the date range).
    const body = {
      ...values,
      location: emptyToNull(values.location),
      description: emptyToNull(values.description),
    };

    // Not caught: ProjectFormDialog needs the rejection to map error.errors
    // onto its fields — `endDate must be after startDate` is server-only,
    // because the backend compares a sent date against the stored one.
    await updateProject.mutateAsync({ id: project.id, body });
    toast.success("Project updated", { description: body.name });
    onOpenChange(false);
  };

  return (
    <ProjectFormDialog
      open={open}
      onOpenChange={onOpenChange}
      schema={updateProjectSchema}
      defaultValues={toFormValues(project)}
      onSubmit={hdlUpdate}
      title="Edit Project"
      description={`Update the details of ${project.name}.`}
      submitLabel="Save Changes"
      pendingLabel="Saving…"
      requireDirty
    />
  );
}
