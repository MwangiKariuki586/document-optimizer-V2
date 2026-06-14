"use client";

import { useState } from "react";
import { Upload, FileText, Plus } from "lucide-react";
import { UploadDropzone } from "@/components/upload/UploadDropzone";
import { PasteTextForm } from "@/components/upload/PasteTextForm";
import { BlankDocumentForm } from "@/components/upload/BlankDocumentForm";

type Tab = "upload" | "blank" | "paste";

const TABS: { id: Tab; label: string; Icon: React.ElementType }[] = [
  { id: "upload", label: "Upload File", Icon: Upload },
  { id: "blank", label: "Create Blank", Icon: Plus },
  { id: "paste", label: "Paste Text", Icon: FileText },
];

export function UploadTabs() {
  const [activeTab, setActiveTab] = useState<Tab>("upload");

  return (
    <div className="rounded-2xl border border-border bg-surface shadow-card-soft">
      {/* Tab bar */}
      <div
        role="tablist"
        aria-label="Document creation method"
        className="flex border-b border-border"
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

      {/* Tab panels */}
      <div className="p-6">
        {activeTab === "upload" && (
          <div
            id="upload-panel-upload"
            role="tabpanel"
            aria-labelledby="upload-tab-upload"
          >
            <UploadDropzone />
          </div>
        )}
        {activeTab === "blank" && (
          <div
            id="upload-panel-blank"
            role="tabpanel"
            aria-labelledby="upload-tab-blank"
          >
            <BlankDocumentForm />
          </div>
        )}
        {activeTab === "paste" && (
          <div
            id="upload-panel-paste"
            role="tabpanel"
            aria-labelledby="upload-tab-paste"
          >
            <PasteTextForm />
          </div>
        )}
      </div>
    </div>
  );
}
