import type {
  LucideIcon,
} from "lucide-react";

import {
  ArrowLeft,
  Award,
  CarFront,
  Check,
  Compass,
  Flag,
  Globe2,
  MapPin,
  Milestone,
  PlaneTakeoff,
  RotateCcw,
  Route,
  Sparkles,
  Trophy,
  UserRound,
} from "lucide-react";

import {
  revalidatePath,
} from "next/cache";

import Link from "next/link";

import {
  redirect,
} from "next/navigation";

import { ProfileCard } from "@/components/profile/profile-card";

import {
  createAdminClient,
  createClient,
} from "@/lib/supabase/server";

type TripRow = {
  id: string;

  route_mode:
    | "journey"
    | "road_trip"
    | "places_only";

  returns_to_start: boolean;
};

type PlaceRow = {
  trip_id: string;
  name: string;

  country_code:
    | string
    | null;

  country_name:
    | string
    | null;
};

type BadgeTone =
  | "blue"
  | "green"
  | "amber"
  | "violet"
  | "rose";

type Badge = {
  id: string;
  title: string;
  description: string;

  progressLabel: string;

  progress: number;
  target: number;

  earned: boolean;

  tone: BadgeTone;

  Icon: LucideIcon;
};

const ALLOWED_AVATARS =
  new Set([
    "avatar:01",
    "avatar:02",
    "avatar:03",
    "avatar:04",
    "avatar:05",
    "avatar:06",
    "avatar:07",
    "avatar:08",
    "avatar:09",
    "avatar:10",
  ]);

function countryKey(
  place: PlaceRow,
) {
  if (
    place.country_code
  ) {
    return place.country_code
      .trim()
      .toUpperCase();
  }

  if (
    place.country_name
  ) {
    return place.country_name
      .trim()
      .toLowerCase();
  }

  return null;
}

function badgeToneClasses(
  _tone: BadgeTone,
  earned: boolean,
) {
  if (!earned) {
    return {
      card:
        "border-white/[0.055] bg-[#0d0f12]",

      icon:
        "border-white/[0.06] bg-white/[0.025] text-white/18",

      progress:
        "bg-white/18",
    };
  }

  return {
    card:
      "border-white/[0.11] bg-[linear-gradient(145deg,rgba(255,255,255,0.045),rgba(255,255,255,0.018))] shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]",

    icon:
      "border-white/[0.11] bg-white/[0.055] text-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",

    progress:
      "bg-white/55",
  };
}

function buildBadges(
  trips: TripRow[],
  places: PlaceRow[],
) {
  const countries =
    new Set<string>();

  const uniquePlaces =
    new Set<string>();

  const tripPlaceCounts =
    new Map<
      string,
      number
    >();

  for (
    const place of places
  ) {
    const country =
      countryKey(place);

    if (country) {
      countries.add(
        country,
      );
    }

    uniquePlaces.add(
      [
        country ??
          "unknown",

        place.name
          .trim()
          .toLowerCase(),
      ].join(":"),
    );

    tripPlaceCounts.set(
      place.trip_id,

      (
        tripPlaceCounts.get(
          place.trip_id,
        ) ?? 0
      ) + 1,
    );
  }

  const tripCount =
    trips.length;

  const countryCount =
    countries.size;

  const placeCount =
    uniquePlaces.size;

  const roadTripCount =
    trips.filter(
      (trip) =>
        trip.route_mode ===
        "road_trip",
    ).length;

  const longestTrip =
    Math.max(
      0,
      ...tripPlaceCounts.values(),
    );

  const hasFullCircle =
    trips.some(
      (trip) =>
        trip.returns_to_start,
    );

  const scandinavianCodes = [
    "DK",
    "NO",
    "SE",
  ];

  const nordicCodes = [
    "DK",
    "NO",
    "SE",
    "FI",
    "IS",
  ];

  const scandinaviaCount =
    scandinavianCodes.filter(
      (code) =>
        countries.has(
          code,
        ),
    ).length;

  const nordicCount =
    nordicCodes.filter(
      (code) =>
        countries.has(
          code,
        ),
    ).length;

  const badges: Badge[] = [
    {
      id: "first-trip",
      title:
        "first trip",
      description:
        "your atlas begins.",
      progressLabel: `${Math.min(
        tripCount,
        1,
      )}/1 trip`,
      progress:
        Math.min(
          tripCount,
          1,
        ),
      target: 1,
      earned:
        tripCount >= 1,
      tone: "blue",
      Icon: PlaneTakeoff,
    },

    {
      id:
        "getting-around",
      title:
        "getting around",
      description:
        "five trips logged.",
      progressLabel: `${Math.min(
        tripCount,
        5,
      )}/5 trips`,
      progress:
        Math.min(
          tripCount,
          5,
        ),
      target: 5,
      earned:
        tripCount >= 5,
      tone: "green",
      Icon: Route,
    },

    {
      id:
        "frequent-traveller",
      title:
        "frequent traveller",
      description:
        "ten trips in your atlas.",
      progressLabel: `${Math.min(
        tripCount,
        10,
      )}/10 trips`,
      progress:
        Math.min(
          tripCount,
          10,
        ),
      target: 10,
      earned:
        tripCount >= 10,
      tone: "violet",
      Icon: Trophy,
    },

    {
      id:
        "three-borders",
      title:
        "three borders",
      description:
        "visit three countries.",
      progressLabel: `${Math.min(
        countryCount,
        3,
      )}/3 countries`,
      progress:
        Math.min(
          countryCount,
          3,
        ),
      target: 3,
      earned:
        countryCount >= 3,
      tone: "green",
      Icon: Flag,
    },

    {
      id:
        "five-countries",
      title:
        "five countries",
      description:
        "five countries on the map.",
      progressLabel: `${Math.min(
        countryCount,
        5,
      )}/5 countries`,
      progress:
        Math.min(
          countryCount,
          5,
        ),
      target: 5,
      earned:
        countryCount >= 5,
      tone: "amber",
      Icon: Globe2,
    },

    {
      id:
        "ten-countries",
      title:
        "ten countries",
      description:
        "double digits.",
      progressLabel: `${Math.min(
        countryCount,
        10,
      )}/10 countries`,
      progress:
        Math.min(
          countryCount,
          10,
        ),
      target: 10,
      earned:
        countryCount >= 10,
      tone: "blue",
      Icon: Award,
    },

    {
      id:
        "twenty-countries",
      title:
        "twenty countries",
      description:
        "the atlas is getting serious.",
      progressLabel: `${Math.min(
        countryCount,
        20,
      )}/20 countries`,
      progress:
        Math.min(
          countryCount,
          20,
        ),
      target: 20,
      earned:
        countryCount >= 20,
      tone: "rose",
      Icon: Sparkles,
    },

    {
      id:
        "city-collector",
      title:
        "city collector",
      description:
        "ten different places.",
      progressLabel: `${Math.min(
        placeCount,
        10,
      )}/10 places`,
      progress:
        Math.min(
          placeCount,
          10,
        ),
      target: 10,
      earned:
        placeCount >= 10,
      tone: "amber",
      Icon: MapPin,
    },

    {
      id:
        "atlas-builder",
      title:
        "atlas builder",
      description:
        "twenty-five places logged.",
      progressLabel: `${Math.min(
        placeCount,
        25,
      )}/25 places`,
      progress:
        Math.min(
          placeCount,
          25,
        ),
      target: 25,
      earned:
        placeCount >= 25,
      tone: "violet",
      Icon: Compass,
    },

    {
      id: "wayfarer",
      title:
        "wayfarer",
      description:
        "fifty places in your atlas.",
      progressLabel: `${Math.min(
        placeCount,
        50,
      )}/50 places`,
      progress:
        Math.min(
          placeCount,
          50,
        ),
      target: 50,
      earned:
        placeCount >= 50,
      tone: "blue",
      Icon: Milestone,
    },

    {
      id:
        "scandinavia",
      title:
        "scandinavia",
      description:
        "denmark, norway and sweden.",
      progressLabel: `${scandinaviaCount}/3 countries`,
      progress:
        scandinaviaCount,
      target: 3,
      earned:
        scandinaviaCount ===
        3,
      tone: "blue",
      Icon: Globe2,
    },

    {
      id:
        "nordic-circle",
      title:
        "nordic circle",
      description:
        "denmark, norway, sweden, finland and iceland.",
      progressLabel: `${nordicCount}/5 countries`,
      progress:
        nordicCount,
      target: 5,
      earned:
        nordicCount === 5,
      tone: "violet",
      Icon: Sparkles,
    },

    {
      id:
        "road-minded",
      title:
        "road minded",
      description:
        "three road trips.",
      progressLabel: `${Math.min(
        roadTripCount,
        3,
      )}/3 road trips`,
      progress:
        Math.min(
          roadTripCount,
          3,
        ),
      target: 3,
      earned:
        roadTripCount >= 3,
      tone: "amber",
      Icon: CarFront,
    },

    {
      id:
        "the-long-way",
      title:
        "the long way",
      description:
        "one trip with five or more stops.",
      progressLabel: `${Math.min(
        longestTrip,
        5,
      )}/5 stops`,
      progress:
        Math.min(
          longestTrip,
          5,
        ),
      target: 5,
      earned:
        longestTrip >= 5,
      tone: "green",
      Icon: Route,
    },

    {
      id:
        "full-circle",
      title:
        "full circle",
      description:
        "finish where you started.",
      progressLabel:
        hasFullCircle
          ? "completed"
          : "not yet",
      progress:
        hasFullCircle
          ? 1
          : 0,
      target: 1,
      earned:
        hasFullCircle,
      tone: "rose",
      Icon: RotateCcw,
    },
  ];

  return {
    badges,

    stats: {
      trips:
        tripCount,

      countries:
        countryCount,

      places:
        placeCount,
    },
  };
}

function BadgeCard({
  badge,
}: {
  badge: Badge;
}) {
  const style =
    badgeToneClasses(
      badge.tone,
      badge.earned,
    );

  const Icon =
    badge.Icon;

  const percent =
    Math.min(
      100,
      Math.max(
        0,
        (
          badge.progress /
          badge.target
        ) * 100,
      ),
    );

  return (
    <article
      className={`relative overflow-hidden rounded-[22px] border p-5 ${style.card}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-[14px] border ${style.icon}`}
        >
          <Icon
            size={18}
            strokeWidth={1.55}
          />
        </div>

        {badge.earned && (
          <div className="flex h-6 w-6 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-white/50">
            <Check
              size={12}
              strokeWidth={2}
            />
          </div>
        )}
      </div>

      <div className="mt-5">
        <h3
          className={`text-sm font-medium ${
            badge.earned
              ? "text-white/85"
              : "text-white/38"
          }`}
        >
          {badge.title}
        </h3>

        <p
          className={`mt-1.5 min-h-10 text-xs leading-5 ${
            badge.earned
              ? "text-white/35"
              : "text-white/18"
          }`}
        >
          {
            badge.description
          }
        </p>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between gap-3">
          <span
            className={`text-[10px] ${
              badge.earned
                ? "text-white/35"
                : "text-white/18"
            }`}
          >
            {
              badge.progressLabel
            }
          </span>

          <span
            className={`text-[9px] ${
              badge.earned
                ? "text-white/30"
                : "text-white/15"
            }`}
          >
            {badge.earned
              ? "earned"
              : "locked"}
          </span>
        </div>

        <div className="h-[3px] overflow-hidden rounded-full bg-white/[0.055]">
          <div
            className={`h-full rounded-full ${style.progress}`}
            style={{
              width: `${percent}%`,
            }}
          />
        </div>
      </div>
    </article>
  );
}

export default async function SettingsPage() {
  const supabase =
    await createClient();

  const {
    data: { user },
  } =
    await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const [
    profileResult,
    tripsResult,
    placesResult,
  ] =
    await Promise.all([
      supabase
        .from("profiles")
        .select(
          "display_name, avatar_url",
        )
        .eq(
          "id",
          user.id,
        )
        .single(),

      supabase
        .from("trips")
        .select(
          "id, route_mode, returns_to_start",
        )
        .eq(
          "user_id",
          user.id,
        ),

      supabase
        .from(
          "trip_places",
        )
        .select(
          "trip_id, name, country_code, country_name",
        )
        .eq(
          "user_id",
          user.id,
        ),
    ]);

  if (
    profileResult.error
  ) {
    throw new Error(
      `could not load profile: ${profileResult.error.message}`,
    );
  }

  if (
    tripsResult.error
  ) {
    throw new Error(
      `could not load trips: ${tripsResult.error.message}`,
    );
  }

  if (
    placesResult.error
  ) {
    throw new Error(
      `could not load places: ${placesResult.error.message}`,
    );
  }

  const profile =
    profileResult.data;

  const trips =
    (tripsResult.data ??
      []) as TripRow[];

  const places =
    (placesResult.data ??
      []) as PlaceRow[];

  const {
    badges,
    stats,
  } =
    buildBadges(
      trips,
      places,
    );

  const earnedBadges =
    badges.filter(
      (badge) =>
        badge.earned,
    );

  const lockedBadges =
    badges.filter(
      (badge) =>
        !badge.earned,
    );

  async function updateProfile(
    formData: FormData,
  ) {
    "use server";

    const displayName =
      String(
        formData.get(
          "display_name",
        ) ?? "",
      ).trim();

    const requestedAvatar =
      String(
        formData.get(
          "avatar_url",
        ) ?? "",
      ).trim();

    if (
      !displayName ||
      displayName.length >
        80
    ) {
      throw new Error(
        "invalid display name",
      );
    }

    const avatarUrl =
      ALLOWED_AVATARS.has(
        requestedAvatar,
      )
        ? requestedAvatar
        : "avatar:01";

    const supabase =
      await createClient();

    const {
      data: {
        user: activeUser,
      },
    } =
      await supabase.auth.getUser();

    if (!activeUser) {
      redirect("/auth");
    }

    const { error } =
      await supabase
        .from("profiles")
        .update({
          display_name:
            displayName,

          avatar_url:
            avatarUrl,

          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          activeUser.id,
        );

    if (error) {
      throw new Error(
        `could not update profile: ${error.message}`,
      );
    }

    revalidatePath(
      "/settings",
    );

    revalidatePath("/");
    revalidatePath(
      "/places",
    );
  }

  async function deleteProfile() {
    "use server";

    const supabase =
      await createClient();

    const {
      data: {
        user: activeUser,
      },
      error: userError,
    } =
      await supabase.auth.getUser();

    if (
      userError ||
      !activeUser
    ) {
      redirect("/auth");
    }

    const admin =
      createAdminClient();

    const userId =
      activeUser.id;

    const {
      error:
        tripPlacesDeleteError,
    } =
      await admin
        .from(
          "trip_places",
        )
        .delete()
        .eq(
          "user_id",
          userId,
        );

    if (
      tripPlacesDeleteError
    ) {
      throw new Error(
        `could not delete trip places: ${tripPlacesDeleteError.message}`,
      );
    }

    const {
      error:
        tripsDeleteError,
    } =
      await admin
        .from("trips")
        .delete()
        .eq(
          "user_id",
          userId,
        );

    if (
      tripsDeleteError
    ) {
      throw new Error(
        `could not delete trips: ${tripsDeleteError.message}`,
      );
    }

    const {
      error:
        profileDeleteError,
    } =
      await admin
        .from(
          "profiles",
        )
        .delete()
        .eq(
          "id",
          userId,
        );

    if (
      profileDeleteError
    ) {
      throw new Error(
        `could not delete profile: ${profileDeleteError.message}`,
      );
    }

    const {
      error:
        authDeleteError,
    } =
      await admin.auth.admin.deleteUser(
        userId,
      );

    if (
      authDeleteError
    ) {
      throw new Error(
        `could not delete account: ${authDeleteError.message}`,
      );
    }

    await supabase.auth.signOut();

    redirect("/auth");
  }

  return (
    <main className="min-h-screen bg-[#090b0e] text-white">
      <div className="mx-auto min-h-screen w-full max-w-7xl px-5 pt-5 pb-24 sm:px-8 sm:pt-6 sm:pb-24">
        <header className="flex items-center">
          <Link
            href="/"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 text-sm text-white/55 transition hover:border-white/[0.14] hover:bg-white/[0.06] hover:text-white"
          >
            <ArrowLeft
              size={16}
              strokeWidth={1.8}
            />

            <span>
              map
            </span>
          </Link>
        </header>

        <section className="mt-8 sm:mt-10">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/[0.09] bg-white/[0.055] text-white/65">
              <UserRound
                size={20}
                strokeWidth={1.7}
              />
            </div>

            <h1 className="text-3xl font-semibold tracking-[-0.045em]">
              profile
            </h1>
          </div>

          <p className="mt-4 max-w-md text-sm leading-6 text-white/40">
            your identity and
            the milestones
            behind your atlas.
          </p>

          <div className="mt-9">
            <ProfileCard
              displayName={
                profile
                  ?.display_name ??
                ""
              }
              avatarUrl={
                profile
                  ?.avatar_url ??
                null
              }
              stats={
                stats
              }
              updateProfile={
                updateProfile
              }
            />
          </div>

          <section className="mt-14 border-t border-white/[0.07] pt-8">
            <div className="flex items-start justify-between gap-6">
              <div>
                <div className="flex items-center gap-2">
                  <Award
                    size={14}
                    strokeWidth={1.7}
                    className="text-white/30"
                  />

                  <p className="text-xs font-medium text-white/35">
                    badges
                  </p>
                </div>

                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white/90">
                  your atlas, in
                  milestones.
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-white/30">
                  every badge
                  stays here. the
                  ones you earn
                  slowly come to
                  life.
                </p>
              </div>

              <div className="shrink-0 rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-2 text-[10px] text-white/25">
                {
                  earnedBadges.length
                }
                /
                {
                  badges.length
                }{" "}
                earned
              </div>
            </div>

            <div className="mt-9 space-y-12">
              {earnedBadges.length >
                0 && (
                <section>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium text-white/50">
                        earned
                      </p>

                      <p className="mt-1 text-[11px] text-white/20">
                        milestones
                        already part
                        of your atlas.
                      </p>
                    </div>

                    <span className="text-[10px] text-white/25">
                      {
                        earnedBadges.length
                      }
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {earnedBadges.map(
                      (
                        badge,
                      ) => (
                        <BadgeCard
                          key={
                            badge.id
                          }
                          badge={
                            badge
                          }
                        />
                      ),
                    )}
                  </div>
                </section>
              )}

              {lockedBadges.length >
                0 && (
                <section>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium text-white/28">
                        locked
                      </p>

                      <p className="mt-1 text-[11px] text-white/15">
                        still
                        somewhere
                        ahead.
                      </p>
                    </div>

                    <span className="text-[10px] text-white/15">
                      {
                        lockedBadges.length
                      }
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {lockedBadges.map(
                      (
                        badge,
                      ) => (
                        <BadgeCard
                          key={
                            badge.id
                          }
                          badge={
                            badge
                          }
                        />
                      ),
                    )}
                  </div>
                </section>
              )}
            </div>
          </section>

          <section className="mt-14 border-t border-white/[0.07] pt-8">
            <div className="rounded-[22px] border border-[#7f1d1d]/25 bg-[#140f11] p-5 sm:p-6">
              <p className="text-xs font-medium text-[#d6a0a0]/70">
                delete profile
              </p>

              <p className="mt-2 max-w-xl text-xs leading-6 text-white/28 sm:text-sm">
                permanently delete your profile, trips and saved places from atlaslog.
              </p>

              <details className="group mt-5">
                <summary className="inline-flex h-10 cursor-pointer list-none items-center justify-center rounded-xl border border-[#8f3030]/30 bg-[#2a1518] px-4 text-xs text-[#e0aaaa]/75 transition hover:border-[#9f3c3c]/45 hover:bg-[#32191d] hover:text-[#efb9b9] [&::-webkit-details-marker]:hidden">
                  delete profile
                </summary>

                <div className="mt-4 rounded-[18px] border border-[#8f3030]/20 bg-black/20 p-4">
                  <p className="text-xs leading-6 text-white/35">
                    this cannot be undone. your account, trips, places and profile data will be permanently deleted.
                  </p>

                  <form
                    action={
                      deleteProfile
                    }
                    className="mt-4"
                  >
                    <button
                      type="submit"
                      className="inline-flex h-10 items-center justify-center rounded-xl border border-[#9f3c3c]/35 bg-[#32191d] px-4 text-xs font-medium text-[#efb9b9]/85 transition hover:border-[#b34b4b]/50 hover:bg-[#3a1d21] hover:text-[#ffd0d0]"
                    >
                      yes, delete everything
                    </button>
                  </form>
                </div>
              </details>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}