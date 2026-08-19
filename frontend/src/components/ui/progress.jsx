"use client"

import * as React from "react"
import { Progress as ProgressPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

// `indicatorClassName` is not stock shadcn. The default fill is `bg-primary`,
// and --primary in this app is the ORANGE #E08A00 — which UI-PROMPT.md PROMPT 0
// rules out for progress bars specifically: at 2.26:1 against the track the two
// halves of the bar stop being separable. Bars fill with #042630. Callers need
// a way to say so without forking the component.
function Progress({
  className,
  indicatorClassName,
  value,
  ...props
}) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-primary/20",
        className
      )}
      {...props}>
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn("h-full w-full flex-1 bg-primary transition-all", indicatorClassName)}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }} />
    </ProgressPrimitive.Root>
  );
}

export { Progress }
