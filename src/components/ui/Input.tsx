import * as React from "react";
import { cn } from "./utils";
import { AlertCircle } from "lucide-react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <div className="relative">
          <input
            type={type}
            className={cn(
              "flex h-10 w-full rounded-xl border bg-transparent px-3 py-2 text-sm transition-all outline-none",
              "focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
              error 
                ? "border-rose-500 focus-visible:border-rose-500 focus-visible:ring-rose-200 dark:focus-visible:ring-rose-900" 
                : "border-slate-200 focus-visible:border-blue-500 focus-visible:ring-blue-100 dark:border-slate-700 dark:focus-visible:ring-blue-900",
              className
            )}
            ref={ref}
            {...props}
          />
          {error && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <AlertCircle className="h-4 w-4 text-rose-500 animate-pulse" />
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-rose-500 font-medium">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
