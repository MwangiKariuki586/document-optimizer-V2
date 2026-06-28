import Image from "next/image";

const previewImage = {
  src: "/May_riley_resume.png",
  alt: "Document Optimizer editor showing the May Riley resume with AI actions and quality metrics.",
  width: 1822,
  height: 1078,
};

export function OptimizationPreview() {
  return (
    <section className="px-4 pb-12">
      <div className="mx-auto max-w-[1200px] overflow-hidden rounded-2xl border border-border-light bg-surface p-2 shadow-card">
        <Image
          src={previewImage.src}
          alt={previewImage.alt}
          width={previewImage.width}
          height={previewImage.height}
          priority
          sizes="(min-width: 1280px) 1200px, calc(100vw - 32px)"
          className="aspect-[1822/1078] w-full rounded-xl object-cover"
        />
      </div>
    </section>
  );
}
