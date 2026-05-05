import * as React from "react"
import { cn } from "@/components/ui/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "brand";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const baseStyles = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  
  const variants = {
    default: "border-transparent bg-slate-900 text-white hover:bg-slate-800",
    brand: "border-transparent bg-primary-100 text-primary-800 hover:bg-primary-200",
    secondary: "border-transparent bg-slate-100 text-slate-900 hover:bg-slate-200",
    destructive: "border-transparent bg-red-100 text-red-800 hover:bg-red-200",
    success: "border-transparent bg-green-100 text-green-800 hover:bg-green-200",
    warning: "border-transparent bg-amber-100 text-amber-800 hover:bg-amber-200",
    outline: "text-slate-950",
  };

  return (
    <div className={cn(baseStyles, variants[variant], className)} {...props} />
  )
}

export { Badge }
