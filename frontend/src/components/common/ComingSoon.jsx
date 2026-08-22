/**
 * The placeholder for a screen or tab whose API does not exist yet.
 *
 * It exists because the sidebar in lib/constants.js lists every destination in
 * the app from day one. Without this, half of those links either 404 or render
 * a blank page, which reads as a broken app rather than an unfinished one —
 * naming the sprint is the whole point.
 *
 * Delete each usage as its sprint lands; when the last one goes, delete this.
 */

import { EmptyState } from "@/components/common/EmptyState";
import { cn } from "@/lib/utils";

export function ComingSoon({ icon, title, sprint, className }) {
  return (
    <EmptyState
      icon={icon}
      title={title}
      description={`ส่วนนี้จะเพิ่มใน Sprint ${sprint}`}
      className={cn("rounded-lg border bg-card", className)}
    />
  );
}
