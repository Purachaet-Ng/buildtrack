/**
 * Create User dialog — the trigger button plus a UserFormDialog seeded empty.
 * Rendered by UsersPage behind `can("user:manage")`: ADMIN only. The backend
 * 403s everyone else regardless.
 *
 * There is no self-service path to a STAFF or CLIENT account: POST /auth/register
 * exists, but an admin creating the account is the flow this app is built around
 * (see APIs.md — "เพิ่มผู้ใช้ใหม่ (สร้างให้พนักงาน)").
 */

import { UserFormDialog } from "@/components/user/UserFormDialog";
import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";
import { useCreateUser } from "@/hooks/useUsers";
import { createUserSchema } from "@/validators/user.validator";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const EMPTY_USER = {
  firstname: "",
  lastname: "",
  email: "",
  password: "",
  // The backend defaults to STAFF too, but the schema requires the field, so
  // the form has to carry a real value.
  role: "STAFF",
  companyId: null,
  phone: "",
};

export function AddUser() {
  const [open, setOpen] = useState(false);
  const createUser = useCreateUser();

  const hdlCreate = async (values) => {
    // zodResolver hands over the TRANSFORMED output: `phone` is already null or
    // digits-only, and `companyId` is already null or a number.
    await createUser.mutateAsync(values);
    toast.success("User created", { description: values.email });
    setOpen(false);
  };

  return (
    <UserFormDialog
      open={open}
      onOpenChange={setOpen}
      schema={createUserSchema}
      defaultValues={EMPTY_USER}
      onSubmit={hdlCreate}
      title="Create User"
      description="Add a new account. The person can sign in with this email and password straight away."
      submitLabel="Add User"
      pendingLabel="Creating…"
      trigger={
        <DialogTrigger asChild>
          <Button>
            <Plus /> Create User
          </Button>
        </DialogTrigger>
      }
    />
  );
}
