"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import React from "react";

type Props = React.PropsWithChildren<{
  className?: string;
}>;

export default function BackToPrevious({ children, className }: Props) {
  const router = useRouter();

  return (
    <button type="button" onClick={() => router.back()} className={className}>
      <ArrowLeft className="size-4" aria-hidden="true" />
      {children}
    </button>
  );
}
