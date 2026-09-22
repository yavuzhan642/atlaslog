import {
  ArrowLeft,
  MapPinned,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { NewTripForm } from "@/components/trips/new-trip-form";
import { createClient } from "@/lib/supabase/server";

type SubmittedPlace = {
  id?: unknown;
  name?: unknown;
  kind?: unknown;
  countryCode?: unknown;
  countryName?: unknown;
  latitude?: unknown;
  longitude?: unknown;
};

type RouteMode =
  | "journey"
  | "road_trip"
  | "places_only";

function buildMonthDate(
  year: string,
  month: string,
) {
  if (!year && !month) {
    return null;
  }

  if (
    !/^\d{4}$/.test(year) ||
    !/^(0[1-9]|1[0-2])$/.test(month)
  ) {
    throw new Error(
      "select both month and year",
    );
  }

  return `${year}-${month}-01`;
}

function parseRouteMode(
  value: FormDataEntryValue | null,
): RouteMode {
  if (
    value === "journey" ||
    value === "road_trip" ||
    value === "places_only"
  ) {
    return value;
  }

  return "journey";
}

export default async function NewTripPage() {
  const supabase =
    await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  async function createTrip(
    formData: FormData,
  ) {
    "use server";

    const supabase =
      await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/auth");
    }

    const title = String(
      formData.get("title") ?? "",
    ).trim();

    const routeMode =
      parseRouteMode(
        formData.get("route_mode"),
      );

    const requestedReturn =
      formData.get(
        "returns_to_start",
      ) === "on";

    const startMonth = String(
      formData.get("start_month") ?? "",
    ).trim();

    const startYear = String(
      formData.get("start_year") ?? "",
    ).trim();

    const endMonth = String(
      formData.get("end_month") ?? "",
    ).trim();

    const endYear = String(
      formData.get("end_year") ?? "",
    ).trim();

    if (
      !startMonth ||
      !startYear ||
      !endMonth ||
      !endYear
    ) {
      throw new Error(
        "trip dates are required",
      );
    }

    const startDate =
      buildMonthDate(
        startYear,
        startMonth,
      );

    const endDate =
      buildMonthDate(
        endYear,
        endMonth,
      );

    const notes =
      String(
        formData.get("notes") ?? "",
      ).trim() || null;

    if (
      !title ||
      title.length > 120
    ) {
      throw new Error(
        "invalid trip title",
      );
    }

    if (
      notes &&
      notes.length > 5000
    ) {
      throw new Error(
        "notes are too long",
      );
    }

    if (
      startDate &&
      endDate &&
      endDate < startDate
    ) {
      throw new Error(
        "end month cannot be before start month",
      );
    }

    let rawPlaces: SubmittedPlace[];

    try {
      const parsed = JSON.parse(
        String(
          formData.get("places") ??
            "[]",
        ),
      );

      if (!Array.isArray(parsed)) {
        throw new Error();
      }

      rawPlaces =
        parsed as SubmittedPlace[];
    } catch {
      throw new Error(
        "invalid places",
      );
    }

    if (
      rawPlaces.length < 1 ||
      rawPlaces.length > 50
    ) {
      throw new Error(
        "select at least one place",
      );
    }

    const places =
      rawPlaces.map(
        (place, index) => {
          const name =
            typeof place.name ===
            "string"
              ? place.name.trim()
              : "";

          const kind =
            place.kind ===
            "country"
              ? "country"
              : "city";

          const countryCode =
            typeof place.countryCode ===
            "string"
              ? place.countryCode
                  .trim()
                  .toUpperCase()
              : null;

          const countryName =
            typeof place.countryName ===
            "string"
              ? place.countryName.trim()
              : null;

          const latitude =
            typeof place.latitude ===
            "number"
              ? place.latitude
              : null;

          const longitude =
            typeof place.longitude ===
            "number"
              ? place.longitude
              : null;

          if (
            !name ||
            name.length > 160 ||
            latitude === null ||
            longitude === null ||
            latitude < -90 ||
            latitude > 90 ||
            longitude < -180 ||
            longitude > 180
          ) {
            throw new Error(
              "invalid place data",
            );
          }

          return {
            name,
            kind,
            country_code:
              countryCode,
            country_name:
              countryName,
            latitude,
            longitude,
            visit_order: index,
          };
        },
      );

    const returnsToStart =
      requestedReturn &&
      places.length >= 2 &&
      routeMode !==
        "places_only";

    const {
      data: trip,
      error: tripError,
    } = await supabase
      .from("trips")
      .insert({
        user_id: user.id,
        title,
        start_date: startDate,
        end_date: endDate,
        notes,
        route_mode: routeMode,
        returns_to_start:
          returnsToStart,
      })
      .select("id")
      .single();

    if (
      tripError ||
      !trip
    ) {
      throw new Error(
        `could not create trip: ${
          tripError?.message ??
          "unknown error"
        }`,
      );
    }

    const {
      error: placesError,
    } = await supabase
      .from("trip_places")
      .insert(
        places.map(
          (place) => ({
            ...place,
            trip_id: trip.id,
            user_id: user.id,
          }),
        ),
      );

    if (placesError) {
      await supabase
        .from("trips")
        .delete()
        .eq("id", trip.id)
        .eq("user_id", user.id);

      throw new Error(
        `could not save trip places: ${placesError.message}`,
      );
    }

    redirect("/");
  }

  return (
    <main className="min-h-screen bg-[#090b0e] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col px-5 py-6 sm:px-8 sm:py-8">
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
            <MapPinned
              size={20}
              strokeWidth={1.7}
            />
          </div>

          <div className="mt-6">
            <h1 className="text-3xl font-semibold tracking-[-0.045em]">
              add trip
            </h1>

            <p className="mt-2 max-w-md text-sm leading-6 text-white/40">
              add places in the order you visited them and choose how the trip should appear on your map.
            </p>
          </div>

          <NewTripForm
            action={createTrip}
          />
        </section>
      </div>
    </main>
  );
}