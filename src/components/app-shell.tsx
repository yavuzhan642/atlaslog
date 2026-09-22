import Link from "next/link";
import {
  Menu,
  Plus,
  UserRound,
} from "lucide-react";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { AtlaslogLogo } from "@/components/atlaslog-logo";
import { TravelMap } from "@/components/map/travel-map";
import { PrimaryNav } from "@/components/primary-nav";

export function AppShell() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#090b0e] text-white">
      <section className="relative min-h-screen p-3 sm:p-4">
        <div className="relative min-h-[calc(100vh-24px)] overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#101419] sm:min-h-[calc(100vh-32px)]">
          <TravelMap />

          <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between px-4 py-4 sm:px-6">
            <div className="pointer-events-auto flex items-center gap-3">
              <button
                type="button"
                aria-label="open navigation"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-black/45 text-white/70 backdrop-blur-xl transition hover:border-white/[0.14] hover:bg-black/60 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 md:hidden"
              >
                <Menu
                  size={18}
                  strokeWidth={1.8}
                />
              </button>

              <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-black/45 px-3 py-2 backdrop-blur-xl">
                <AtlaslogLogo
                  size="sm"
                  priority
                />

                <div>
                  <p className="text-[15px] font-semibold tracking-[-0.02em]">
                    atlaslog
                  </p>

                  <p className="hidden text-[11px] text-white/40 sm:block">
                    personal travel map
                  </p>
                </div>
              </div>
            </div>

            <div className="pointer-events-auto flex items-center gap-2">
              <Link
                href="/settings"
                aria-label="profile settings"
                title="profile"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-black/45 text-white/60 backdrop-blur-xl transition hover:border-white/[0.14] hover:bg-black/60 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              >
                <UserRound
                  size={17}
                  strokeWidth={1.8}
                />
              </Link>

              <SignOutButton />

              <Link
                href="/trips/new"
                className="flex h-10 items-center gap-2 rounded-xl bg-white px-3.5 text-sm font-medium text-[#101216] transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                <Plus
                  size={16}
                  strokeWidth={2}
                />

                <span className="hidden sm:inline">
                  add trip
                </span>
              </Link>
            </div>
          </header>
        </div>
      </section>

      <PrimaryNav />
    </main>
  );
}