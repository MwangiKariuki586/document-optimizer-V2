"use client";

import { FileText, Plus, Upload } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { BlankDocumentForm } from "@/components/upload/BlankDocumentForm";
import { PasteTextForm } from "@/components/upload/PasteTextForm";
import { UploadDropzone } from "@/components/upload/UploadDropzone";
import {
  newDocumentHref,
  parseNewDocumentTab,
  type NewDocumentTab,
} from "@/lib/documents/new-document.routes";

const TABS: { id: NewDocumentTab; label: string; Icon: React.ElementType }[] =
  [
    { id: "upload", label: "Upload File", Icon: Upload },
    { id: "blank", label: "Create Blank", Icon: Plus },
    { id: "paste", label: "Paste Text", Icon: FileText },
  ];

export function UploadTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = parseNewDocumentTab(searchParams.get("tab"));

  function setActiveTab(tab: NewDocumentTab) {
    const nextHref = newDocumentHref(tab);
    const currentTab = parseNewDocumentTab(searchParams.get("tab"));

    if (tab === currentTab) {
      return;
    }

    router.replace(nextHref, { scroll: false });
  }

  return (
    <div className="flex h-full min-h-[420px] flex-col rounded-2xl border border-border bg-surface shadow-card-soft">
      <div
        role="tablist"
        aria-label="Document creation method"
        className="flex shrink-0 border-b border-border"
      >
        {TABS.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              id={`upload-tab-${id}`}
              role="tab"
              aria-selected={isActive}
              aria-controls={`upload-panel-${id}`}
              onClick={() => setActiveTab(id)}
              className={[
                "flex flex-1 items-center justify-center gap-2 border-b-2 px-4 py-4 text-sm font-medium transition-colors sm:flex-none sm:justify-start",
                isActive
                  ? "border-accent text-accent"
                  : "border-transparent text-text-secondary hover:text-text-primary",
              ].join(" ")}
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex min-h-0 flex-1 flex-col p-6">
        {activeTab === "upload" && (
          <div
            id="upload-panel-upload"
            role="tabpanel"
            aria-labelledby="upload-tab-upload"
            className="flex min-h-0 flex-1 flex-col"
          >
            <UploadDropzone />
          </div>
        )}
        {activeTab === "blank" && (
          <div
            id="upload-panel-blank"
            role="tabpanel"
            aria-labelledby="upload-tab-blank"
            className="flex min-h-0 flex-1 flex-col"
          >
            <BlankDocumentForm />
          </div>
        )}
        {activeTab === "paste" && (
          <div
            id="upload-panel-paste"
            role="tabpanel"
            aria-labelledby="upload-tab-paste"
            className="flex min-h-0 flex-1 flex-col"
          >
            <PasteTextForm />
          </div>
        )}
      </div>
    </div>
  );
}
