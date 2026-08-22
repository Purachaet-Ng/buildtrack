/**
 * Edit User dialog. Opened from the row menu in UsersPage behind
 * `can("user:manage")`: ADMIN only.
 *
 * Controlled by the caller rather than owning a DialogTrigger: the trigger is a
 * DropdownMenuItem, and a dialog rendered inside DropdownMenuContent is
 * unmounted the instant the menu closes.
 *
 * Changing a role here changes what the person can do the moment their next
 * request lands — the JWT carries the id, and requireRole reads the row. There
 * is no token to invalidate.
 */

import { UserFormDialog } from "@/components/user/UserFormDialog";
import { useUpdateUser } from "@/hooks/useUsers";
import { updateUserSchema } from "@/validators/user.validator";
import { toast } from "sonner";

/**
 * The list response carries every field the form needs, so editing a row costs
 * no extra request.
 *
 * `phone` and `companyId` are nullable in the schema, and feeding null to an
 * <input> flips it from uncontrolled to controlled on the first keystroke —
 * React warns and the field misbehaves. The Select takes null happily, so only
 * the text inputs are coerced to "".
 */
const toFormValues = (user) => ({
  firstname: user.firstname ?? "",
  lastname: user.lastname ?? "",
  email: user.email ?? "",
  // Always blank: the API never returns a password, and there is nothing to
  // prefill it with. Blank means "leave the current one alone".
  password: "",
  role: user.role ?? "STAFF",
  companyId: user.companyId ?? null,
  phone: user.phone ?? "",
});

export function EditUser({ user, open, onOpenChange }) {
  const updateUser = useUpdateUser();

  const hdlUpdate = async (values) => {
    // The full body, not a diff of changed fields. updateUserSchema is
    // .partial() so a complete body is valid, and the backend re-validates
    // every field anyway. What APIs.md actually asks for — no no-op patch — is
    // handled by requireDirty on the submit button.
    const { password, ...rest } = values;

    // An empty password means "unchanged", not "set it to empty": the backend's
    // min(8) would reject "" outright, so the key is dropped entirely.
    const body = password ? { ...rest, password } : rest;

    // Not caught: UserFormDialog needs the rejection to map error.errors onto
    // its fields — a duplicate email is a 409 that only the server can detect.
    await updateUser.mutateAsync({ id: user.id, body });
    toast.success("User updated", { description: body.email ?? user.email });
    onOpenChange(false);
  };

  return (
    <UserFormDialog
      open={open}
      onOpenChange={onOpenChange}
      schema={updateUserSchema}
      defaultValues={toFormValues(user)}
      onSubmit={hdlUpdate}
      title="Edit User"
      description={`Update the details of ${user.firstname} ${user.lastname}.`}
      submitLabel="Save Changes"
      pendingLabel="Saving…"
      passwordHint="Leave blank to keep the current password."
      requireDirty
    />
  );
}
