import {
  ArrowLeft,
  CalendarDays,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import {
  notFound,
  redirect,
} from "next/navigation";

import { PlaceSearch } from "@/components/trips/place-search";
import { createClient } from "@/lib/supabase/server";

type TripPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type TripPlace = {
  id: string;
  kind: "city" | "country" | "place";
  name: string;
  country_code: string | null;
  country_name: string | null;
  latitude: number | null;
  longitude: number | null;
};

function formatMonth(
  value: string | null,
) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat(
    "en",
    {
      month: "short",
      year: "numeric",
    },
  ).format(
    new Date(`${value}T00:00:00`),
  );
}

function formatTripPeriod(
  startDate: string | null,
  endDate: string | null,
) {
  const start =
    formatMonth(startDate);

  const end =
    formatMonth(endDate);

  if (!start && !end) {
    return null;
  }

  if (start && start === end) {
    return start;
  }

  if (start && end) {
    return `${start} — ${end}`;
  }

  return start ?? end;
}

export default async function TripPage({
  params,
}: TripPageProps) {
  const { id } = await params;

  const supabase =
    await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const {
    data: trip,
    error,
  } = await supabase
    .from("trips")
    .select(
      "id, title, start_date, end_date, notes, created_at",
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !trip) {
    notFound();
  }

  const {
    data: placesData,
    error: placesError,
  } = await supabase
    .from("trip_places")
    .select(
      "id, kind, name, country_code, country_name, latitude, longitude",
    )
    .eq("trip_id", id)
    .eq("user_id", user.id)
    .order("created_at", {
      ascending: true,
    });

  if (placesError) {
    throw new Error(
      `could not load places: ${placesError.message}`,
    );
  }

  const places =
    (placesData ?? []) as TripPlace[];

  const tripPeriod =
    formatTripPeriod(
      trip.start_date,
      trip.end_date,
    );

  return (
    <main className="min-h-screen bg-[#090b0e] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-5 py-6 sm:px-8 sm:py-8">
        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 text-sm text-white/55 transition hover:border-white/[0.14] hover:bg-white/[0.06] hover:text-white"
          >
            <ArrowLeft
              size={16}
              strokeWidth={1.8}
            />
            <span>map</span>
          </Link>

          <span className="text-sm font-semibold tracking-[-0.02em] text-white/90">
            atlaslog
          </span>
        </header>

        <section className="mt-20 sm:mt-24">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.09] bg-white/[0.055] text-white/65">
            <MapPin
              size={20}
              strokeWidth={1.7}
            />
          </div>

          <h1 className="mt-6 text-3xl font-semibold tracking-[-0.045em]">
            {trip.title}
          </h1>

          {tripPeriod && (
            <div className="mt-4 flex items-center gap-2 text-sm text-white/40">
              <CalendarDays
                size={15}
                strokeWidth={1.7}
              />

              <span>
                {tripPeriod}
              </span>
            </div>
          )}

          {trip.notes && (
            <p className="mt-6 max-w-xl whitespace-pre-wrap text-sm leading-7 text-white/50">
              {trip.notes}
            </p>
          )}

          <div className="mt-12 border-t border-white/[0.07] pt-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-white/35">
                  places
                </p>

                <p className="mt-1 text-xs text-white/25">
                  add cities and countries from
                  this trip.
                </p>
              </div>

              {places.length > 0 && (
                <span className="text-xs tabular-nums text-white/25">
                  {places.length}
                </span>
              )}
            </div>

            <div className="mt-5">
              <PlaceSearch
                tripId={trip.id}
              />
            </div>

            {places.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-dashed border-white/[0.1] px-5 py-8">
                <p className="text-sm text-white/55">
                  no places added yet.
                </p>

                <p className="mt-1 text-xs leading-5 text-white/30">
                  search above to add the first
                  place from this trip.
                </p>
              </div>
            ) : (
              <div className="mt-5 space-y-2">
                {places.map(
                  (place) => (
                    <div
                      key={place.id}
                      className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] px-4 py-3"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.035] text-white/45">
                        <MapPin
                          size={15}
                          strokeWidth={
                            1.8
                          }
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white/80">
                          {place.name}
                        </p>

                        <p className="mt-0.5 text-xs text-white/30">
                          {place.kind}

                          {place.country_name &&
                            place.country_name !==
                              place.name &&
                            ` · ${place.country_name}`}
                        </p>
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}