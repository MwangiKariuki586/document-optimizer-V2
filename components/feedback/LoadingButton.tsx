"use client";

import { CometSpinner } from "@/components/loading-ui/CometSpinner";

type LoadingButtonProps = {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
};

export function LoadingButton({
  children,
  className = "",
  disabled = false,
  isLoading = false,
  loadingText,
  type = "button",
  onClick,
}: LoadingButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-70 ${className}`}
      disabled={disabled || isLoading}
      onClick={onClick}
      aria-busy={isLoading}
    >
      {isLoading ? <CometSpinner className="size-4" /> : null}
      {isLoading && loadingText ? loadingText : children}
    </button>
  );
}
