import React from "react";

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverLift?: boolean;
  onClick?: () => void;
}

export function Card({
  children,
  className = "",
  hoverLift = false,
  onClick,
}: CardProps) {
  return (
    <div
      className={`bg-card/80 backdrop-blur-xl border border-subtle rounded-3xl overflow-hidden ${hoverLift ? "hover:translate-y-[-4px] hover:border-primary/40 hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)] hover:shadow-primary/10 transition-all duration-300" : ""} ${onClick ? "cursor-pointer" : ""} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
