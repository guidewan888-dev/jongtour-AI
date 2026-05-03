import * as React from "react";
import { cn } from "./utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "success" | "warning" | "error" | "info" | "neutral";
  pulse?: boolean;
}

function Badge({ className, variant = "neutral", pulse = false, children, ...props }: BadgeProps) {
  const variants = {
    success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800",
    warning: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800",
    error: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200 dark:border-rose-800",
    info: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800",
    neutral: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700",
  };

  const pulseColors = {
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    error: "bg-rose-500",
    info: "bg-blue-500",
    neutral: "bg-slate-500",
  };

  return (
    <div className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", variants[variant], className)} {...props}>
      {pulse && (
        <span className="relative flex h-2 w-2 mr-1.5">
          <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", pulseColors[variant])}></span>
          <span className={cn("relative inline-flex rounded-full h-2 w-2", pulseColors[variant])}></span>
        </span>
      )}
      {children}
    </div>
  );
}

export { Badge };
