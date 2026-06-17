"use client";

type EditorMenuBackdropProps = {
  onClose: () => void;
};

export function EditorMenuBackdrop({ onClose }: EditorMenuBackdropProps) {
  return (
    <button
      type="button"
      aria-hidden
      tabIndex={-1}
      className="fixed inset-0 z-40 cursor-default"
      onClick={onClose}
    />
  );
}
