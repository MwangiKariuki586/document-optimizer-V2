type PageShellProps = {
  children: React.ReactNode;
};

export function PageShell({ children }: PageShellProps) {
  return (
    <main className="flex-1 bg-background px-4 py-6 md:px-6 md:py-8">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6">
        {children}
      </div>
    </main>
  );
}
