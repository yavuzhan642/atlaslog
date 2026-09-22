"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("atlaslog sign out error:", error);
      return;
    }

    router.push("/auth");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      aria-label="sign out"
      title="sign out"
      className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-black/45 text-white/60 backdrop-blur-xl transition hover:border-white/[0.14] hover:bg-black/60 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
    >
      <LogOut size={17} strokeWidth={1.8} />
    </button>
  );
}