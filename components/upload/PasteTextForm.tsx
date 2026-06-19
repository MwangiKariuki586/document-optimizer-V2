"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";
import { LoadingButton } from "@/components/feedback/LoadingButton";
import {
  DOCUMENT_CONTENT_MAX,
  TITLE_ALLOWED_MESSAGE,
  TITLE_ALLOWED_PATTERN,
} from "@/lib/documents/document.validators";
import { appToast } from "@/lib/feedback/toast";

type CreateDocumentResponse = {
  success: boolean;
  data?: { id: string; title: string };
  error?: string;
};

export function PasteTextForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trimmedTitle = title.trim();
  const trimmedContent = content.trim();
  const hasInvalidTitle =
    trimmedTitle.length > 0 && !TITLE_ALLOWED_PATTERN.test(trimmedTitle);
  const canSubmit =
    trimmedTitle.length > 0 && trimmedContent.length > 0 && !hasInvalidTitle;

  const wordCount = trimmedContent ? trimmedContent.split(/\s+/).length : 0;
  const charCount = content.length;

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
        body: JSON.stringify({
          sourceType: "paste",
          title: trimmedTitle,
          content: trimmedContent,
        }),
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
      console.error("[paste-document/create]", error);
      appToast.error("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <form
      id="paste-text-form"
      className="flex min-h-0 flex-1 flex-col gap-4"
      onSubmit={handleSubmit}
      aria-label="Paste text document form"
    >
      {/* Document title */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="paste-title"
          className="text-sm font-medium text-text-primary"
        >
          Document title <span className="text-error" aria-label="required">*</span>
        </label>
        <input
          id="paste-title"
          type="text"
          placeholder="e.g. Q3 Marketing Copy"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          disabled={isSubmitting}
          aria-invalid={hasInvalidTitle}
          aria-describedby={hasInvalidTitle ? "paste-title-error" : undefined}
          className={[
            "w-full rounded-md border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-soft focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-70",
            hasInvalidTitle
              ? "border-error focus:border-error focus:ring-error"
              : "border-border focus:border-accent focus:ring-accent",
          ].join(" ")}
        />
        {hasInvalidTitle ? (
          <p id="paste-title-error" className="text-xs text-error">
            {TITLE_ALLOWED_MESSAGE}
          </p>
        ) : null}
      </div>

      {/* Pasted content */}
      <div className="flex min-h-0 flex-1 flex-col gap-1.5">
        <label
          htmlFor="paste-content"
          className="text-sm font-medium text-text-primary"
        >
          Content <span className="text-error" aria-label="required">*</span>
        </label>
        <textarea
          id="paste-content"
          placeholder="Paste your text here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          maxLength={DOCUMENT_CONTENT_MAX}
          disabled={isSubmitting}
          className="min-h-[180px] w-full flex-1 resize-none rounded-lg border border-border bg-surface p-4 text-sm text-text-primary placeholder:text-text-soft focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent disabled:cursor-not-allowed disabled:opacity-70 lg:min-h-0"
        />
        {/* Word and character count */}
        <p className="self-end text-xs text-text-muted">
          {wordCount} {wordCount === 1 ? "word" : "words"} · {charCount} characters
        </p>
      </div>

      <LoadingButton
        type="submit"
        isLoading={isSubmitting}
        loadingText="Creating..."
        disabled={!canSubmit}
        className="self-start px-5 py-2.5 font-semibold"
      >
        <FileText className="size-4" aria-hidden="true" />
        Create Document
      </LoadingButton>
    </form>
  );
}
