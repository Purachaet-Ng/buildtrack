import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge conditional class names, letting later Tailwind utilities win. */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * "" from an untouched optional form field means "absent", not an empty string.
 *
 * Every nullable column in the API (`location`, `description`, `contactPhone`…)
 * is `.nullish()` on both sides, so sending null keeps the row clean instead of
 * storing a blank that then has to be treated as "empty" everywhere it is read.
 */
export function emptyToNull(value) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}
