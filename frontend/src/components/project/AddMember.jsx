/**
 * เพิ่มทีมงาน dialog — pick a user, give them a role on this project.
 *
 * `roleInProject` is free text on the model ("Site Engineer", "Architect",
 * "Foreman"): it is a job title on the job, NOT the RBAC `UserRole`. The two
 * are shown side by side in the picker so it stays obvious which is which.
 *
 * The candidate list comes from GET /users, which is ADMIN + PM — the same two
 * roles the member endpoints allow, so anyone who can open this dialog can also
 * populate it. People already on the team are filtered out client-side; adding
 * one anyway is a 409 from the controller and lands in the error alert.
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAddProjectMember } from "@/hooks/useMember";
import { useUsers } from "@/hooks/useUsers";
import { ROLE_META } from "@/lib/constants";
import { AlertCircle, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

/**
 * One page big enough to hold every user in a demo dataset. The picker is a
 * Select, not a paged table — if this app ever has more than a hundred users
 * this becomes a search-as-you-type combobox, not a second page button.
 */
const CANDIDATE_QUERY = { limit: 100, sort: "firstname" };

export function AddMember({ projectId, existingUserIds = [] }) {
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [roleInProject, setRoleInProject] = useState("");
  const [error, setError] = useState(null);

  const addMember = useAddProjectMember(projectId);

  // Only fetched once the dialog is open: the roster page itself has no use for
  // the full user directory.
  const { data: users, isLoading } = useUsers(CANDIDATE_QUERY, {
    enabled: open,
  });

  const alreadyOnTeam = new Set(existingUserIds);
  const candidates = (users?.data ?? []).filter(
    (user) => !alreadyOnTeam.has(user.id),
  );

  const hdlOpenChange = (next) => {
    setOpen(next);
    if (!next) {
      setUserId("");
      setRoleInProject("");
      setError(null);
    }
  };

  const hdlSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    try {
      await addMember.mutateAsync({
        userId: Number(userId),
        roleInProject: roleInProject.trim(),
      });
      toast.success("เพิ่มทีมงานแล้ว");
      hdlOpenChange(false);
    } catch (addError) {
      setError(addError.message);
    }
  };

  const isValid = userId !== "" && roleInProject.trim() !== "";

  return (
    <Dialog open={open} onOpenChange={hdlOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus />
          เพิ่มทีมงาน
        </Button>
      </DialogTrigger>

      {/* The form lives INSIDE DialogContent, not around <Dialog>: DialogContent
          renders through a portal, so a form wrapped around the dialog ends up
          with none of its inputs and the submit event never fires. */}
      <DialogContent className="sm:max-w-md">
        <form onSubmit={hdlSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>เพิ่มทีมงาน</DialogTitle>
            <DialogDescription>
              เลือกผู้ใช้และระบุบทบาทในโครงการนี้
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <FieldGroup className="mt-4">
            <Field>
              <FieldLabel htmlFor="member-user">ผู้ใช้</FieldLabel>
              <Select value={userId} onValueChange={setUserId}>
                <SelectTrigger id="member-user" className="w-full">
                  <SelectValue
                    placeholder={isLoading ? "กำลังโหลด…" : "เลือกผู้ใช้"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {candidates.map((user) => (
                    <SelectItem key={user.id} value={String(user.id)}>
                      {user.firstname} {user.lastname} ·{" "}
                      {ROLE_META[user.role]?.label ?? user.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!isLoading && candidates.length === 0 && (
                <FieldError>ทุกคนอยู่ในโครงการนี้แล้ว</FieldError>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="member-role">บทบาทในโครงการ</FieldLabel>
              <Input
                id="member-role"
                value={roleInProject}
                onChange={(event) => setRoleInProject(event.target.value)}
                placeholder="เช่น Site Engineer, Architect, Foreman"
                maxLength={100}
              />
            </Field>
          </FieldGroup>

          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                ยกเลิก
              </Button>
            </DialogClose>
            <Button type="submit" disabled={!isValid || addMember.isPending}>
              {addMember.isPending ? "กำลังเพิ่ม…" : "เพิ่มทีมงาน"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
