"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function LineTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref && ref.startsWith("line_")) {
      const lineUid = ref.replace("line_", "");
      // Save cookie for 30 days
      document.cookie = `jongtour_line_uid=${lineUid}; path=/; max-age=${60 * 60 * 24 * 30}`;
    }
  }, [searchParams]);

  return null;
}
