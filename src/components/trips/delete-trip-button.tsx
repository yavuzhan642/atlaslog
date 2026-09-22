"use client";

import { Trash2 } from "lucide-react";

type DeleteTripButtonProps = {
  tripId: string;
  action: (formData: FormData) => void | Promise<void>;
};

export function DeleteTripButton({
  tripId,
  action,
}: DeleteTripButtonProps) {
  return (
    <button
      type="submit"
      name="trip_id"
      value={tripId}
      formAction={action}
      formNoValidate
      onClick={(event) => {
        const confirmed = window.confirm(
          "delete this trip permanently?",
        );

        if (!confirmed) {
          event.preventDefault();
        }
      }}
      className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-xs text-red-300/55 transition hover:bg-red-400/[0.08] hover:text-red-200"
    >
      <Trash2
        size={14}
        strokeWidth={1.7}
      />
      delete
    </button>
  );
}