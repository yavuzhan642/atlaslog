"use client";

import { LoaderCircle } from "lucide-react";
import { useFormStatus } from "react-dom";

export function SaveTripButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-9 items-center gap-2 rounded-lg bg-white px-4 text-xs font-medium text-[#111318] transition hover:bg-white/90 disabled:cursor-wait disabled:opacity-60"
    >
      {pending && (
        <LoaderCircle
          size={13}
          className="animate-spin"
        />
      )}

      {pending
        ? "saving..."
        : "save changes"}
    </button>
  );
}