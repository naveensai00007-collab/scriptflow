import { forwardRef } from "react";
import { cn } from "../../lib/utils";

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "tertiary" | "danger";
  size?: "sm" | "md" | "lg";
  label: string; // Accessible aria-label is required
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      variant = "tertiary",
      size = "md",
      label,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: "w-8 h-8 text-xs",
      md: "w-9 h-9 text-sm",
      lg: "w-11 h-11 text-base",
    };

    const variantClasses = {
      primary:
        "bg-primary text-white hover:bg-primary-hover active:bg-primary/95 focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 shadow-sm",
      secondary:
        "bg-surface text-text hover:bg-surface-2 active:bg-surface-2/80 border border-border focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 shadow-sm",
      tertiary:
        "bg-transparent text-text-muted hover:text-text hover:bg-surface-2 active:bg-surface-2/70 focus-visible:ring-2 focus-visible:ring-focus",
      danger:
        "bg-transparent text-error hover:bg-error/10 active:bg-error/20 focus-visible:ring-2 focus-visible:ring-error",
    };

    return (
      <button
        ref={ref}
        aria-label={label}
        title={label}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center rounded-btn transition-colors duration-150 outline-none select-none disabled:opacity-50 disabled:pointer-events-none shrink-0",
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

IconButton.displayName = "IconButton";