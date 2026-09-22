"use client";

import {
  LoaderCircle,
  MapPin,
  Plus,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useState,
} from "react";

type GeocodeResult = {
  id: string;
  name: string;
  label: string;
  kind: "city" | "country";
  countryCode: string | null;
  countryName: string | null;
  latitude: number;
  longitude: number;
};

type GeocodeResponse = {
  results: GeocodeResult[];
};

type PlaceSearchProps = {
  tripId: string;
};

export function PlaceSearch({
  tripId,
}: PlaceSearchProps) {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<
    GeocodeResult[]
  >([]);
  const [searching, setSearching] =
    useState(false);
  const [addingId, setAddingId] = useState<
    string | null
  >(null);
  const [error, setError] = useState<
    string | null
  >(null);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }

    const controller = new AbortController();

    const timeout = window.setTimeout(
      async () => {
        setSearching(true);
        setError(null);

        try {
          const response = await fetch(
            `/api/geocode?q=${encodeURIComponent(
              trimmedQuery,
            )}`,
            {
              signal: controller.signal,
            },
          );

          if (!response.ok) {
            throw new Error(
              "could not search places",
            );
          }

          const data =
            (await response.json()) as GeocodeResponse;

          setResults(data.results);
        } catch (requestError) {
          if (
            requestError instanceof DOMException &&
            requestError.name === "AbortError"
          ) {
            return;
          }

          setResults([]);
          setError("place search failed.");
        } finally {
          if (!controller.signal.aborted) {
            setSearching(false);
          }
        }
      },
      300,
    );

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  async function addPlace(
    place: GeocodeResult,
  ) {
    setAddingId(place.id);
    setError(null);

    try {
      const response = await fetch(
        `/api/trips/${tripId}/places`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: place.name,
            kind: place.kind,
            countryCode: place.countryCode,
            countryName: place.countryName,
            latitude: place.latitude,
            longitude: place.longitude,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          "could not add place",
        );
      }

      setQuery("");
      setResults([]);

      router.refresh();
    } catch {
      setError("could not add this place.");
    } finally {
      setAddingId(null);
    }
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search
          size={16}
          strokeWidth={1.8}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
        />

        <input
          type="search"
          value={query}
          onChange={(event) =>
            setQuery(event.target.value)
          }
          placeholder="search a city or country"
          autoComplete="off"
          className="h-12 w-full rounded-xl border border-white/[0.09] bg-white/[0.045] pl-11 pr-11 text-sm text-white outline-none transition placeholder:text-white/25 hover:border-white/[0.13] focus:border-white/[0.22] focus:bg-white/[0.06]"
        />

        {searching && (
          <LoaderCircle
            size={16}
            strokeWidth={1.8}
            className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-white/35"
          />
        )}
      </div>

      {error && (
        <p className="mt-2 text-xs text-white/40">
          {error}
        </p>
      )}

      {results.length > 0 && (
        <div className="absolute inset-x-0 top-[56px] z-30 overflow-hidden rounded-2xl border border-white/[0.09] bg-[#111419]/95 p-1.5 backdrop-blur-2xl">
          {results.map((place) => {
            const adding =
              addingId === place.id;

            return (
              <button
                key={place.id}
                type="button"
                disabled={addingId !== null}
                onClick={() =>
                  void addPlace(place)
                }
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-white/[0.06] disabled:cursor-wait disabled:opacity-50"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-white/45">
                  <MapPin
                    size={16}
                    strokeWidth={1.8}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white/85">
                    {place.name}
                  </p>

                  <p className="mt-0.5 truncate text-xs text-white/35">
                    {place.label}
                  </p>
                </div>

                <div className="flex h-8 w-8 shrink-0 items-center justify-center text-white/40">
                  {adding ? (
                    <LoaderCircle
                      size={15}
                      className="animate-spin"
                    />
                  ) : (
                    <Plus
                      size={15}
                      strokeWidth={1.9}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}