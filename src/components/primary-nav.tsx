"use client";

import Link from "next/link";
import {
  Compass,
  Globe2,
  MapPin,
} from "lucide-react";
import { usePathname } from "next/navigation";

const navigationItems = [
  {
    label: "map",
    icon: Globe2,
    href: "/",
  },
  {
    label: "places",
    icon: MapPin,
    href: "/places",
  },
  {
    label: "explore",
    icon: Compass,
    href: "/explore",
  },
];

export function PrimaryNav() {
  const pathname =
    usePathname();

  return (
    <aside className="fixed bottom-5 left-5 z-40 hidden w-[188px] md:block">
      <nav
        aria-label="primary navigation"
        className="rounded-[18px] border border-white/[0.09] bg-black/60 p-1.5 shadow-2xl backdrop-blur-2xl"
      >
        {navigationItems.map(
          (item) => {
            const Icon =
              item.icon;

            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(
                    item.href,
                  );

            return (
              <Link
                key={
                  item.label
                }
                href={
                  item.href
                }
                className={[
                  "flex w-full items-center gap-3 rounded-[13px] px-3 py-2.5 text-left text-[13px] transition",
                  active
                    ? "bg-white/[0.1] text-white"
                    : "text-white/50 hover:bg-white/[0.055] hover:text-white/80",
                ].join(
                  " ",
                )}
              >
                <Icon
                  size={16}
                  strokeWidth={
                    1.8
                  }
                />

                <span>
                  {
                    item.label
                  }
                </span>
              </Link>
            );
          },
        )}
      </nav>
    </aside>
  );
}