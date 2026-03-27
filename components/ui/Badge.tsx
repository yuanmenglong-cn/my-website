import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "primary" | "secondary";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium",
        variant === "default" && "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
        variant === "primary" && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
        variant === "secondary" && "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
        className
      )}
      {...props}
    />
  );
}
