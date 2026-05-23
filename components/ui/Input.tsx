"use client";

import React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-bright mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-dim">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full bg-void border border-subtle rounded-xl px-4 py-3 text-bright placeholder:text-dim focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-colors ${icon ? "pl-10" : ""} ${error ? "border-danger/50 focus:border-danger/50 focus:ring-danger/20" : ""} ${className}`}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-danger">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
