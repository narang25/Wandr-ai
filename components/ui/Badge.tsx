import React from "react";

export type BadgeVariant = "primary" | "violet" | "gold" | "success" | "danger";

export interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  primary: "bg-primary/10 text-primary",
  violet: "bg-violet/10 text-violet",
  gold: "bg-gold/10 text-gold",
  success: "bg-success/10 text-success",
  danger: "bg-danger/10 text-danger",
};

export function Badge({
  variant = "primary",
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
