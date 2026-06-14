"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { LoadingButton } from "@/components/feedback/LoadingButton";
import {
  TITLE_ALLOWED_MESSAGE,
  TITLE_ALLOWED_PATTERN,
} from "@/lib/documents/document.validators";
import { appToast } from "@/lib/feedback/toast";

type CreateDocumentResponse = {
  success: boolean;
  data?: { id: string; title: string };
  error?: string;
};

export function BlankDocumentForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trimmedTitle = title.trim();
  const hasInvalidChars =
    trimmedTitle.length > 0 && !TITLE_ALLOWED_PATTERN.test(trimmedTitle);
  const canSubmit = trimmedTitle.length > 0 && !hasInvalidChars;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceType: "blank", title: trimmedTitle }),
      });

      const result = (await response.json()) as CreateDocumentResponse;

      if (!response.ok || !result.success || !result.data) {
        appToast.error(result.error ?? "Could not create the document.");
        setIsSubmitting(false);
        return;
      }

      appToast.success("Document created.");
      router.push(`/documents/${result.data.id}`);
    } catch (error) {
      console.error("[blank-document/create]", error);
      appToast.error("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <form
      id="blank-document-form"
      className="flex flex-col gap-6"
      onSubmit={handleSubmit}
      aria-label="Create blank document form"
    >
      {/* Blank document illustration */}
      <div className="flex flex-col items-center gap-4 rounded-xl border border-border-light bg-surface-muted py-10">
        <span
          className="flex size-16 items-center justify-center rounded-2xl bg-accent-light text-accent"
          aria-hidden="true"
        >
          <Plus className="size-8" />
        </span>
        <div className="text-center">
          <p className="text-sm font-semibold text-text-primary">
            Start with a blank canvas
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            Give your document a title and open it in the editor.
          </p>
        </div>
      </div>

      {/* Document title */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="blank-title"
          className="text-sm font-medium text-text-primary"
        >
          Document title <span className="text-error" aria-label="required">*</span>
        </label>
        <input
          id="blank-title"
          type="text"
          placeholder="e.g. Untitled Document"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          disabled={isSubmitting}
          aria-invalid={hasInvalidChars}
          aria-describedby={hasInvalidChars ? "blank-title-error" : undefined}
          className={[
            "w-full rounded-md border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-soft focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-70",
            hasInvalidChars
              ? "border-error focus:border-error focus:ring-error"
              : "border-border focus:border-accent focus:ring-accent",
          ].join(" ")}
        />
        {hasInvalidChars ? (
          <p id="blank-title-error" className="text-xs text-error">
            {TITLE_ALLOWED_MESSAGE}
          </p>
        ) : null}
      </div>

      <LoadingButton
        type="submit"
        isLoading={isSubmitting}
        loadingText="Creating..."
        disabled={!canSubmit}
        className="self-start px-5 py-2.5 font-semibold"
      >
        <Plus className="size-4" aria-hidden="true" />
        Create Document
      </LoadingButton>
    </form>
  );
}
