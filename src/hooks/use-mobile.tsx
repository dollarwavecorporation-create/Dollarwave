import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = React.useState<boolean>(false);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = (ev?: MediaQueryListEvent) => {
      // Prefer the event's matches when available, otherwise fall back to window width
      const matches = typeof ev !== "undefined" ? ev.matches : mql.matches;
      setIsMobile(matches);
    };

    // set initial state from the media query
    setIsMobile(mql.matches);

    // add listener with fallback for older browsers
    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    }

    // deprecated fallback for older browsers (typed via local cast)
    const legacy = mql as unknown as {
      addListener?: (fn: (ev?: MediaQueryListEvent) => void) => void;
      removeListener?: (fn: (ev?: MediaQueryListEvent) => void) => void;
    };
    if (legacy.addListener && legacy.removeListener) {
      legacy.addListener(onChange);
      return () => legacy.removeListener!(onChange);
    }
  }, []);

  return isMobile;
}
