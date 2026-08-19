/**
 * Debounces a value — used by every search input so typing does not fire a
 * request per keystroke. 300ms default.
 */

import { useEffect, useState } from "react";

export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    // Clearing on every change is what makes this a debounce rather than a
    // throttle: only the last keystroke in a quiet window survives.
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
