import React from "react";

export const MOBILE_BREAKPOINT = 768;
export const TABLET_BREAKPOINT = 1024;

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState<boolean>(false);

  React.useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === "undefined") return;

    const media = window.matchMedia(query);
    const onChange = () => {
      setMatches(media.matches);
    };

    media.addEventListener("change", onChange);
    setMatches(media.matches);

    return () => media.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

export function useIsMobile() {
  return useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
}

export function useIsTablet() {
  return useMediaQuery(
    `(min-width: ${MOBILE_BREAKPOINT}px) and (max-width: ${
      TABLET_BREAKPOINT - 1
    }px)`
  );
}

export function useIsDesktop() {
  return useMediaQuery(`(min-width: ${TABLET_BREAKPOINT}px)`);
}

export function useScreenSize() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isDesktop = useIsDesktop();

  return { isMobile, isTablet, isDesktop };
}
