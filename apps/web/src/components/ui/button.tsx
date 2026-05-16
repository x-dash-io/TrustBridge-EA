import { type ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "outline" | "accent";
type ButtonSize = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-white hover:bg-accent/90 border border-accent hover:border-accent",
  secondary:
    "bg-transparent text-fg border border-border hover:border-accent hover:bg-surface",
  outline:
    "bg-transparent text-fg border border-border hover:border-accent hover:bg-surface",
  danger:
    "bg-transparent text-danger border border-danger hover:bg-danger hover:text-white",
  ghost:
    "bg-transparent text-muted hover:text-accent border border-transparent hover:border-accent/20",
  accent:
    "bg-accent text-white border border-accent hover:opacity-90",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "text-[12px] px-4 py-2",
  md: "text-[13px] px-6 py-3",
  lg: "text-[14px] px-8 py-4",
  icon: "h-10 w-10",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`inline-flex items-center justify-center font-[600] cursor-pointer transition-all duration-150
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}
          ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
