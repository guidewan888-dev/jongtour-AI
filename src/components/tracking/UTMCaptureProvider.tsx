"use client";
import { useUTMCapture } from "@/hooks/useUTMCapture";

/**
 * UTMCaptureProvider — Drop-in client component
 * Place in layout to auto-capture UTM params on every page load
 */
export default function UTMCaptureProvider({ children }: { children?: React.ReactNode }) {
  useUTMCapture();
  return <>{children}</>;
}
