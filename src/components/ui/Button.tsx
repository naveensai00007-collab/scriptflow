import { forwardRef } from "react";
import { cn } from "../../lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "tertiary" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "secondary",
      size = "md",
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: "h-8 px-2.5 text-xs",
      md: "h-9 px-3.5 text-sm",
      lg: "h-11 px-5 text-base",
    };

    const variantClasses = {
      primary:
        "bg-primary text-white hover:bg-primary-hover active:bg-primary/95 focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 border border-transparent shadow-sm",
      secondary:
        "bg-surface text-text hover:bg-surface-2 active:bg-surface-2/80 border border-border focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 shadow-sm",
      tertiary:
        "bg-transparent text-text-muted hover:text-text hover:bg-surface-2 active:bg-surface-2/70 focus-visible:ring-2 focus-visible:ring-focus",
      danger:
        "bg-error text-white hover:bg-error/90 active:bg-error/80 focus-visible:ring-2 focus-visible:ring-error focus-visible:ring-offset-2 shadow-sm",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center font-medium rounded-btn transition-colors duration-150 outline-none select-none disabled:opacity-50 disabled:pointer-events-none gap-2",
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";