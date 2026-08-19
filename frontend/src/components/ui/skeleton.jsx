import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-accent", className)}
      {...props}
    />
  );
}

export { Skeleton };

export function SkeletonTable() {
  return (
    <div className="flex w-full  flex-col gap-2">
      {Array.from({ length: 7 }).map((_, index) => (
        <div className="flex gap-4" key={index}>
          <Skeleton className="h-20 flex-2" />
          <Skeleton className="h-20 flex-1" />
          <Skeleton className="h-20 flex-1" />
        </div>
      ))}
    </div>
  );
}
