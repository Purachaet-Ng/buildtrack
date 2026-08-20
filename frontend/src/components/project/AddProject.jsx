/**
 * Create Project dialog — the trigger button plus a ProjectFormDialog seeded
 * empty. Rendered by ProjectsPage behind `can("project:create")`: ADMIN and PM.
 * The backend 403s everyone else regardless.
 */

import { ProjectFormDialog } from "@/components/project/ProjectFormDialog";
import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";
import { useCreateProject } from "@/hooks/useProject";
import { emptyToNull } from "@/lib/utils";
import { createProjectSchema } from "@/validators/project.validator";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const EMPTY_PROJECT = {
  name: "",
  location: "",
  description: "",
  clientCompanyId: "",
  // Left undefined rather than "": the schema coerces "" to Invalid Date, which
  // reports as a type error instead of "required".
  startDate: undefined,
  endDate: undefined,
  budget: "",
  // The backend defaults to PLANNING too, but createProjectSchema requires the
  // field, so the form has to carry a real value.
  status: "PLANNING",
};

export function AddProject() {
  const [open, setOpen] = useState(false);
  const createProject = useCreateProject();

  const hdlCreate = async (values) => {
    // zodResolver hands over the TRANSFORMED output: budget is already a Number
    // and the dates are Date objects, which axios serialises to ISO strings and
    // the backend's createProjectBody coerces back. Only the optionals need a
    // touch-up, so that a blank field is absent rather than "".
    const body = {
      ...values,
      location: emptyToNull(values.location),
      description: emptyToNull(values.description),
    };

    // Not caught: ProjectFormDialog needs the rejection to map error.errors
    // onto its fields.
    await createProject.mutateAsync(body);
    toast.success("Project created", { description: body.name });
    setOpen(false);
  };

  return (
    <ProjectFormDialog
      open={open}
      onOpenChange={setOpen}
      schema={createProjectSchema}
      defaultValues={EMPTY_PROJECT}
      onSubmit={hdlCreate}
      title="Create Project"
      description="Add a new construction project. All fields except location and description are required."
      submitLabel="Add Project"
      pendingLabel="Creating…"
      trigger={
        <DialogTrigger asChild>
          <Button>
            <Plus /> Create Project
          </Button>
        </DialogTrigger>
      }
    />
  );
}
