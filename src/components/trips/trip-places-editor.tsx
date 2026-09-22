"use client";

import {
  LoaderCircle,
  MapPin,
  Plus,
  Search,
  X,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";

type SavedPlace = {
  id: string;
  kind:
    | "city"
    | "country"
    | "place";
  name: string;
  country_code: string | null;
  country_name: string | null;
  latitude: number | null;
  longitude: number | null;
};

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

type TripPlacesEditorProps = {
  tripId: string;
  initialPlaces: SavedPlace[];
};

function isSamePlace(
  saved: SavedPlace,
  result: GeocodeResult,
) {
  return (
    saved.name
      .trim()
      .toLowerCase() ===
      result.name
        .trim()
        .toLowerCase() &&
    (saved.country_code ?? "") ===
      (result.countryCode ?? "")
  );
}

export function TripPlacesEditor({
  tripId,
  initialPlaces,
}: TripPlacesEditorProps) {
  const [places, setPlaces] =
    useState(initialPlaces);

  const [query, setQuery] =
    useState("");

  const [results, setResults] =
    useState<GeocodeResult[]>([]);

  const [searching, setSearching] =
    useState(false);

  const [addingId, setAddingId] =
    useState<string | null>(null);

  const [removingId, setRemovingId] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    const trimmed =
      query.trim();

    if (trimmed.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }

    const controller =
      new AbortController();

    const timeout =
      window.setTimeout(
        async () => {
          setSearching(true);
          setError(null);

          try {
            const response =
              await fetch(
                `/api/geocode?q=${encodeURIComponent(
                  trimmed,
                )}`,
                {
                  signal:
                    controller.signal,
                },
              );

            if (!response.ok) {
              throw new Error();
            }

            const data =
              (await response.json()) as {
                results: GeocodeResult[];
              };

            setResults(
              data.results.filter(
                (result) =>
                  !places.some(
                    (place) =>
                      isSamePlace(
                        place,
                        result,
                      ),
                  ),
              ),
            );
          } catch (requestError) {
            if (
              requestError instanceof
                DOMException &&
              requestError.name ===
                "AbortError"
            ) {
              return;
            }

            setResults([]);
            setError(
              "could not search places.",
            );
          } finally {
            if (
              !controller.signal
                .aborted
            ) {
              setSearching(false);
            }
          }
        },
        300,
      );

    return () => {
      window.clearTimeout(
        timeout,
      );

      controller.abort();
    };
  }, [query, places]);

  async function addPlace(
    place: GeocodeResult,
  ) {
    setAddingId(place.id);
    setError(null);

    try {
      const response =
        await fetch(
          `/api/trips/${tripId}/places`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              name: place.name,
              kind: place.kind,
              countryCode:
                place.countryCode,
              countryName:
                place.countryName,
              latitude:
                place.latitude,
              longitude:
                place.longitude,
            }),
          },
        );

      if (!response.ok) {
        throw new Error();
      }

      const data =
        (await response.json()) as {
          place: SavedPlace;
        };

      setPlaces((current) => [
        ...current,
        data.place,
      ]);

      setQuery("");
      setResults([]);
    } catch {
      setError(
        "could not add this place.",
      );
    } finally {
      setAddingId(null);
    }
  }

  async function removePlace(
    place: SavedPlace,
  ) {
    const confirmed =
      window.confirm(
        `remove ${place.name} from this trip?`,
      );

    if (!confirmed) {
      return;
    }

    setRemovingId(place.id);
    setError(null);

    try {
      const response =
        await fetch(
          `/api/trips/${tripId}/places/${place.id}`,
          {
            method: "DELETE",
          },
        );

      if (!response.ok) {
        throw new Error();
      }

      setPlaces((current) =>
        current.filter(
          (currentPlace) =>
            currentPlace.id !==
            place.id,
        ),
      );
    } catch {
      setError(
        "could not remove this place.",
      );
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[11px] text-white/35">
          places
        </p>

        <span className="text-[11px] tabular-nums text-white/25">
          {places.length}
        </span>
      </div>

      <div className="relative">
        <Search
          size={15}
          strokeWidth={1.8}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
        />

        <input
          type="search"
          value={query}
          onChange={(event) =>
            setQuery(
              event.target.value,
            )
          }
          autoComplete="off"
          placeholder="add a city or country"
          className="h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.035] pl-10 pr-10 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/[0.18]"
        />

        {searching && (
          <LoaderCircle
            size={15}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-white/30"
          />
        )}

        {results.length > 0 && (
          <div className="absolute inset-x-0 top-[50px] z-40 overflow-hidden rounded-xl border border-white/[0.09] bg-[#111419]/95 p-1.5 shadow-2xl backdrop-blur-2xl">
            {results.map(
              (place) => {
                const adding =
                  addingId ===
                  place.id;

                return (
                  <button
                    key={place.id}
                    type="button"
                    disabled={
                      addingId !==
                      null
                    }
                    onClick={() =>
                      void addPlace(
                        place,
                      )
                    }
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-white/[0.06] disabled:opacity-50"
                  >
                    <MapPin
                      size={15}
                      className="shrink-0 text-white/35"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-white/80">
                        {place.name}
                      </p>

                      <p className="mt-0.5 truncate text-[11px] text-white/30">
                        {place.label}
                      </p>
                    </div>

                    {adding ? (
                      <LoaderCircle
                        size={14}
                        className="animate-spin text-white/35"
                      />
                    ) : (
                      <Plus
                        size={14}
                        className="text-white/35"
                      />
                    )}
                  </button>
                );
              },
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-[11px] text-white/35">
          {error}
        </p>
      )}

      {places.length > 0 && (
        <div className="mt-3 space-y-2">
          {places.map(
            (place) => {
              const removing =
                removingId ===
                place.id;

              return (
                <div
                  key={place.id}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2.5"
                >
                  <MapPin
                    size={14}
                    className="shrink-0 text-white/35"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-white/70">
                      {place.name}
                    </p>

                    {place.country_name &&
                      place.country_name !==
                        place.name && (
                        <p className="mt-0.5 truncate text-[11px] text-white/25">
                          {
                            place.country_name
                          }
                        </p>
                      )}
                  </div>

                  <button
                    type="button"
                    disabled={
                      removingId !==
                      null
                    }
                    aria-label={`remove ${place.name}`}
                    onClick={() =>
                      void removePlace(
                        place,
                      )
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 transition hover:bg-red-400/[0.08] hover:text-red-200 disabled:opacity-40"
                  >
                    {removing ? (
                      <LoaderCircle
                        size={13}
                        className="animate-spin"
                      />
                    ) : (
                      <X
                        size={14}
                      />
                    )}
                  </button>
                </div>
              );
            },
          )}
        </div>
      )}
    </div>
  );
}