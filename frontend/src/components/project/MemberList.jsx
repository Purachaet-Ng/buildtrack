/**
 * Project team: avatar initials, name, role in the project, and remove action
 * for ADMIN/PM. Used in the ทีมงาน tab and the ภาพรวม right column.
 *
 * Two different "roles" appear on every row and they are not the same thing:
 *   roleInProject — free text on project_member, the job on this site
 *   user.role     — the RBAC UserRole, rendered as a ROLE_META chip
 *
 * `compact` is the ภาพรวม variant: no add button, no remove, no card chrome.
 */

import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState } from "@/components/common/EmptyState";
import { StatusChip } from "@/components/common/StatusChip";
import { AddMember } from "@/components/project/AddMember";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectMembers, useRemoveProjectMember } from "@/hooks/useMember";
import { usePermission } from "@/hooks/usePermission";
import { ROLE_META } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

/** "สมชาย ใจดี" → "สใ". Falls back to "?" so a row never renders an empty circle. */
const initials = (user) =>
  `${user?.firstname?.[0] ?? ""}${user?.lastname?.[0] ?? ""}` || "?";

const fullName = (user) =>
  [user?.firstname, user?.lastname].filter(Boolean).join(" ") || "—";

function MemberRow({ member, projectId, canManage }) {
  const [confirming, setConfirming] = useState(false);
  const removeMember = useRemoveProjectMember(projectId);
  const { user } = member;

  // Not caught: ConfirmDialog awaits this and puts the rejection in its alert.
  const hdlRemove = async () => {
    await removeMember.mutateAsync(member.userId);
    toast.success("นำออกจากทีมแล้ว", { description: fullName(user) });
    setConfirming(false);
  };

  return (
    <li className="flex items-center gap-3 py-3">
      <Avatar>
        <AvatarFallback className="bg-primary-100 text-[13px] font-medium text-primary-800">
          {initials(user)}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-medium text-heading">
          {fullName(user)}
        </p>
        <p className="truncate text-[13px] text-muted-fg">
          {member.roleInProject}
        </p>
      </div>

      <StatusChip value={user?.role} map={ROLE_META} className="shrink-0" />

      {canManage && (
        <>
          <Button
            variant="ghost"
            size="icon-sm"
            className="shrink-0 text-muted-fg hover:text-destructive"
            aria-label={`นำ ${fullName(user)} ออกจากทีม`}
            onClick={() => setConfirming(true)}
          >
            <Trash2 />
          </Button>

          {confirming && (
            <ConfirmDialog
              open
              onOpenChange={setConfirming}
              title="นำออกจากทีม?"
              description={
                <>
                  <span className="font-medium text-heading">
                    {fullName(user)}
                  </span>{" "}
                  จะถูกนำออกจากทีมของโครงการนี้ งานที่มอบหมายไว้แล้วจะยังอยู่
                  แต่จะมองไม่เห็นโครงการนี้อีก
                </>
              }
              confirmLabel="นำออกจากทีม"
              pendingLabel="กำลังนำออก…"
              cancelLabel="ยกเลิก"
              onConfirm={hdlRemove}
            />
          )}
        </>
      )}
    </li>
  );
}

export function MemberList({ projectId, compact = false, className }) {
  const { can } = usePermission();
  const { data, isLoading, isError } = useProjectMembers(projectId);

  // Hiding the controls is cosmetic — the backend 403s a PM who is not on this
  // project regardless of what the UI renders.
  const canManage = !compact && can("project:update");

  const members = data?.data ?? [];
  const existingUserIds = members.map((member) => member.userId);

  if (isLoading) {
    return (
      <div className={cn("flex flex-col gap-3", className)}>
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className={cn("text-[13px] text-muted-fg", className)}>
        โหลดรายชื่อทีมงานไม่สำเร็จ
      </p>
    );
  }

  return (
    <div className={cn("flex flex-col", className)}>
      {!compact && (
        <div className="flex items-center justify-between gap-4 pb-2">
          <p className="text-[13px] text-muted-fg">
            ทีมงาน {members.length} คน
          </p>
          {can("project:update") && (
            <AddMember
              projectId={projectId}
              existingUserIds={existingUserIds}
            />
          )}
        </div>
      )}

      {members.length === 0 ? (
        <EmptyState
          description="ยังไม่มีทีมงานในโครงการนี้"
          className={compact ? "py-8" : undefined}
        />
      ) : (
        <ul className="divide-y">
          {members.map((member) => (
            <MemberRow
              key={member.id}
              member={member}
              projectId={projectId}
              canManage={canManage}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
