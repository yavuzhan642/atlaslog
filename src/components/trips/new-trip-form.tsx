"use client";

import {
  CarFront,
  LoaderCircle,
  MapPin,
  Plus,
  Route,
  Search,
  Undo2,
  X,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";
import { useFormStatus } from "react-dom";

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

type NewTripFormProps = {
  action: (
    formData: FormData,
  ) => void | Promise<void>;
};

type RouteMode =
  | "journey"
  | "road_trip"
  | "places_only";

const months = [
  {
    value: "01",
    label: "January",
  },
  {
    value: "02",
    label: "February",
  },
  {
    value: "03",
    label: "March",
  },
  {
    value: "04",
    label: "April",
  },
  {
    value: "05",
    label: "May",
  },
  {
    value: "06",
    label: "June",
  },
  {
    value: "07",
    label: "July",
  },
  {
    value: "08",
    label: "August",
  },
  {
    value: "09",
    label: "September",
  },
  {
    value: "10",
    label: "October",
  },
  {
    value: "11",
    label: "November",
  },
  {
    value: "12",
    label: "December",
  },
];

const currentYear =
  new Date().getFullYear();

const years = Array.from(
  {
    length:
      currentYear -
      1950 +
      6,
  },
  (_, index) =>
    currentYear +
    5 -
    index,
);

function SubmitButton({
  disabled,
}: {
  disabled: boolean;
}) {
  const { pending } =
    useFormStatus();

  return (
    <button
      type="submit"
      disabled={
        pending ||
        disabled
      }
      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#e9ecef] px-6 text-sm font-medium text-[#111318] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
    >
      {pending && (
        <LoaderCircle
          size={15}
          className="animate-spin"
        />
      )}

      {pending
        ? "creating trip"
        : "create trip"}
    </button>
  );
}

function MonthYearFields({
  prefix,
  label,
}: {
  prefix:
    | "start"
    | "end";
  label: string;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-white/45">
        {label}
      </p>

      <div className="grid grid-cols-[1.35fr_1fr] gap-2">
        <select
          name={`${prefix}_month`}
          defaultValue=""
          aria-label={`${label} month`}
          className="h-12 w-full rounded-xl border border-white/[0.09] bg-[#14171b] px-3 text-sm text-white/70 outline-none transition hover:border-white/[0.13] focus:border-white/[0.22]"
        >
          <option value="">
            month
          </option>

          {months.map(
            (month) => (
              <option
                key={
                  month.value
                }
                value={
                  month.value
                }
              >
                {
                  month.label
                }
              </option>
            ),
          )}
        </select>

        <select
          name={`${prefix}_year`}
          defaultValue=""
          aria-label={`${label} year`}
          className="h-12 w-full rounded-xl border border-white/[0.09] bg-[#14171b] px-3 text-sm text-white/70 outline-none transition hover:border-white/[0.13] focus:border-white/[0.22]"
        >
          <option value="">
            year
          </option>

          {years.map(
            (year) => (
              <option
                key={year}
                value={year}
              >
                {year}
              </option>
            ),
          )}
        </select>
      </div>
    </div>
  );
}

export function NewTripForm({
  action,
}: NewTripFormProps) {
  const [
    query,
    setQuery,
  ] = useState("");

  const [
    results,
    setResults,
  ] =
    useState<
      GeocodeResult[]
    >([]);

  const [
    places,
    setPlaces,
  ] =
    useState<
      GeocodeResult[]
    >([]);

  const [
    searching,
    setSearching,
  ] =
    useState(false);

  const [
    searchError,
    setSearchError,
  ] =
    useState<
      string | null
    >(null);

  const [
    formError,
    setFormError,
  ] =
    useState<
      string | null
    >(null);

  const [
    routeMode,
    setRouteMode,
  ] =
    useState<RouteMode>(
      "journey",
    );

  const [
    returnsToStart,
    setReturnsToStart,
  ] =
    useState(false);

  useEffect(() => {
    const trimmed =
      query.trim();

    if (
      trimmed.length < 2
    ) {
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
          setSearchError(
            null,
          );

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

            if (
              !response.ok
            ) {
              throw new Error(
                "search failed",
              );
            }

            const data =
              (await response.json()) as {
                results:
                  GeocodeResult[];
              };

            setResults(
              data.results.filter(
                (
                  result,
                ) =>
                  !places.some(
                    (
                      place,
                    ) =>
                      place.id ===
                      result.id,
                  ),
              ),
            );
          } catch (
            error
          ) {
            if (
              error instanceof
                DOMException &&
              error.name ===
                "AbortError"
            ) {
              return;
            }

            setResults(
              [],
            );

            setSearchError(
              "could not search places.",
            );
          } finally {
            if (
              !controller
                .signal
                .aborted
            ) {
              setSearching(
                false,
              );
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
  }, [
    query,
    places,
  ]);

  function addPlace(
    place: GeocodeResult,
  ) {
    if (
      places.some(
        (current) =>
          current.id ===
          place.id,
      )
    ) {
      return;
    }

    setPlaces(
      (current) => [
        ...current,
        place,
      ],
    );

    setQuery("");
    setResults([]);
  }

  function removePlace(
    placeId: string,
  ) {
    setPlaces(
      (current) => {
        const next =
          current.filter(
            (place) =>
              place.id !==
              placeId,
          );

        if (
          next.length < 2
        ) {
          setReturnsToStart(
            false,
          );
        }

        return next;
      },
    );
  }

  function changeRouteMode(
    mode: RouteMode,
  ) {
    setRouteMode(mode);

    if (
      mode ===
      "places_only"
    ) {
      setReturnsToStart(
        false,
      );
    }
  }

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    setFormError(null);

    const formData =
      new FormData(
        event.currentTarget,
      );

    const startMonth =
      String(
        formData.get(
          "start_month",
        ) ?? "",
      );

    const startYear =
      String(
        formData.get(
          "start_year",
        ) ?? "",
      );

    const endMonth =
      String(
        formData.get(
          "end_month",
        ) ?? "",
      );

    const endYear =
      String(
        formData.get(
          "end_year",
        ) ?? "",
      );

    if (
      !startMonth ||
      !startYear ||
      !endMonth ||
      !endYear
    ) {
      event.preventDefault();

      setFormError(
        "please select trip dates.",
      );

      return;
    }

    const startValue =
      `${startYear}-${startMonth}`;

    const endValue =
      `${endYear}-${endMonth}`;

    if (
      endValue <
      startValue
    ) {
      event.preventDefault();

      setFormError(
        "end month cannot be before start month.",
      );
    }
  }

  const canReturnToStart =
    places.length >= 2 &&
    routeMode !==
      "places_only";

  return (
    <form
      action={action}
      onSubmit={
        handleSubmit
      }
      className="mt-10"
    >
      <input
        type="hidden"
        name="places"
        value={JSON.stringify(
          places,
        )}
      />

      <div className="grid grid-cols-1 gap-7 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-8">
        <section className="space-y-7 rounded-[24px] border border-white/[0.07] bg-white/[0.018] p-5 sm:p-6">
          <div>
            <p className="text-[11px] font-medium text-white/25">
              trip details
            </p>

            <p className="mt-1 text-sm text-white/45">
              name the trip and add the places you visited.
            </p>
          </div>

          <div>
            <label
              htmlFor="title"
              className="mb-2 block text-xs font-medium text-white/45"
            >
              trip title
            </label>

            <input
              id="title"
              name="title"
              type="text"
              required
              maxLength={
                120
              }
              placeholder="norwegian fjords"
              className="h-12 w-full rounded-xl border border-white/[0.09] bg-white/[0.045] px-4 text-sm text-white outline-none transition placeholder:text-white/20 hover:border-white/[0.13] focus:border-white/[0.22] focus:bg-white/[0.06]"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="place-search"
                className="text-xs font-medium text-white/45"
              >
                where did
                you go?
              </label>

              {places.length >
                0 && (
                <span className="text-[11px] text-white/25">
                  {
                    places.length
                  }{" "}
                  selected
                </span>
              )}
            </div>

            <div className="relative">
              <div className="relative">
                <Search
                  size={16}
                  strokeWidth={
                    1.8
                  }
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                />

                <input
                  id="place-search"
                  type="search"
                  value={
                    query
                  }
                  onChange={(
                    event,
                  ) =>
                    setQuery(
                      event
                        .target
                        .value,
                    )
                  }
                  placeholder="search a city or country"
                  autoComplete="off"
                  className="h-12 w-full rounded-xl border border-white/[0.09] bg-white/[0.045] pl-11 pr-11 text-sm text-white outline-none transition placeholder:text-white/20 hover:border-white/[0.13] focus:border-white/[0.22] focus:bg-white/[0.06]"
                />

                {searching && (
                  <LoaderCircle
                    size={
                      16
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-white/35"
                  />
                )}
              </div>

              {results.length >
                0 && (
                <div className="absolute inset-x-0 top-[56px] z-30 overflow-hidden rounded-2xl border border-white/[0.09] bg-[#111419]/95 p-1.5 shadow-2xl backdrop-blur-2xl">
                  {results.map(
                    (
                      place,
                    ) => (
                      <button
                        key={
                          place.id
                        }
                        type="button"
                        onClick={() =>
                          addPlace(
                            place,
                          )
                        }
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-white/[0.06]"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-white/45">
                          <MapPin
                            size={
                              16
                            }
                            strokeWidth={
                              1.8
                            }
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-white/85">
                            {
                              place.name
                            }
                          </p>

                          <p className="mt-0.5 truncate text-xs text-white/35">
                            {
                              place.label
                            }
                          </p>
                        </div>

                        <Plus
                          size={
                            15
                          }
                          className="shrink-0 text-white/35"
                        />
                      </button>
                    ),
                  )}
                </div>
              )}
            </div>

            {searchError && (
              <p className="mt-2 text-xs text-white/35">
                {
                  searchError
                }
              </p>
            )}

            {places.length >
              0 && (
              <div className="mt-3 space-y-2">
                {places.map(
                  (
                    place,
                    index,
                  ) => (
                    <div
                      key={
                        place.id
                      }
                      className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.04] text-[11px] font-medium tabular-nums text-white/40">
                        {index +
                          1}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-white/75">
                          {
                            place.name
                          }
                        </p>

                        <p className="truncate text-[11px] text-white/30">
                          {place.countryName ??
                            place.kind}
                        </p>
                      </div>

                      <button
                        type="button"
                        aria-label={`remove ${place.name}`}
                        onClick={() =>
                          removePlace(
                            place.id,
                          )
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 transition hover:bg-white/[0.06] hover:text-white/70"
                      >
                        <X
                          size={
                            14
                          }
                        />
                      </button>
                    </div>
                  ),
                )}
              </div>
            )}

            {places.length ===
              0 && (
              <p className="mt-2 text-[11px] leading-5 text-white/25">
                add places
                in the order
                you visited
                them.
              </p>
            )}
          </div>
        </section>

        <section className="space-y-7 rounded-[24px] border border-white/[0.07] bg-white/[0.018] p-5 sm:p-6">
          <div>
            <p className="text-[11px] font-medium text-white/25">
              trip setup
            </p>

            <p className="mt-1 text-sm text-white/45">
              choose how this trip should appear on your atlas.
            </p>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-white/45">
              trip route
            </p>

            <div className="grid gap-2">
              <label
                className={[
                  "flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3.5 transition",
                  routeMode ===
                  "journey"
                    ? "border-white/[0.18] bg-white/[0.06]"
                    : "border-white/[0.08] bg-white/[0.025] hover:border-white/[0.13]",
                ].join(
                  " ",
                )}
              >
                <input
                  type="radio"
                  name="route_mode"
                  value="journey"
                  checked={
                    routeMode ===
                    "journey"
                  }
                  onChange={() =>
                    changeRouteMode(
                      "journey",
                    )
                  }
                  className="sr-only"
                />

                <Route
                  size={17}
                  strokeWidth={
                    1.7
                  }
                  className="mt-0.5 shrink-0 text-white/55"
                />

                <span>
                  <span className="block text-sm font-medium text-white/80">
                    journey
                  </span>

                  <span className="mt-1 block text-xs leading-5 text-white/30">
                    connect
                    places in
                    the order
                    you visited
                    them.
                  </span>
                </span>
              </label>

              <label
                className={[
                  "flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3.5 transition",
                  routeMode ===
                  "road_trip"
                    ? "border-white/[0.18] bg-white/[0.06]"
                    : "border-white/[0.08] bg-white/[0.025] hover:border-white/[0.13]",
                ].join(
                  " ",
                )}
              >
                <input
                  type="radio"
                  name="route_mode"
                  value="road_trip"
                  checked={
                    routeMode ===
                    "road_trip"
                  }
                  onChange={() =>
                    changeRouteMode(
                      "road_trip",
                    )
                  }
                  className="sr-only"
                />

                <CarFront
                  size={17}
                  strokeWidth={
                    1.7
                  }
                  className="mt-0.5 shrink-0 text-white/55"
                />

                <span>
                  <span className="block text-sm font-medium text-white/80">
                    road trip
                  </span>

                  <span className="mt-1 block text-xs leading-5 text-white/30">
                    follow real
                    roads between
                    your stops.
                  </span>
                </span>
              </label>

              <label
                className={[
                  "flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3.5 transition",
                  routeMode ===
                  "places_only"
                    ? "border-white/[0.18] bg-white/[0.06]"
                    : "border-white/[0.08] bg-white/[0.025] hover:border-white/[0.13]",
                ].join(
                  " ",
                )}
              >
                <input
                  type="radio"
                  name="route_mode"
                  value="places_only"
                  checked={
                    routeMode ===
                    "places_only"
                  }
                  onChange={() =>
                    changeRouteMode(
                      "places_only",
                    )
                  }
                  className="sr-only"
                />

                <MapPin
                  size={17}
                  strokeWidth={
                    1.7
                  }
                  className="mt-0.5 shrink-0 text-white/55"
                />

                <span>
                  <span className="block text-sm font-medium text-white/80">
                    places only
                  </span>

                  <span className="mt-1 block text-xs leading-5 text-white/30">
                    show your
                    places without
                    connecting
                    them.
                  </span>
                </span>
              </label>
            </div>

            <label
              className={[
                "mt-3 flex items-center gap-3 rounded-xl border px-4 py-3 transition",
                canReturnToStart
                  ? "cursor-pointer border-white/[0.08] bg-white/[0.025] hover:border-white/[0.13]"
                  : "cursor-not-allowed border-white/[0.05] bg-white/[0.015] opacity-40",
              ].join(
                " ",
              )}
            >
              <input
                type="checkbox"
                name="returns_to_start"
                checked={
                  returnsToStart
                }
                disabled={
                  !canReturnToStart
                }
                onChange={(
                  event,
                ) =>
                  setReturnsToStart(
                    event
                      .target
                      .checked,
                  )
                }
                className="h-4 w-4 accent-white"
              />

              <Undo2
                size={16}
                strokeWidth={
                  1.7
                }
                className="text-white/45"
              />

              <span>
                <span className="block text-sm text-white/70">
                  return to
                  first place
                </span>

                {places.length >
                  0 && (
                  <span className="mt-0.5 block text-[11px] text-white/30">
                    end the
                    journey
                    back in{" "}
                    {
                      places[0]
                        .name
                    }
                  </span>
                )}
              </span>
            </label>
          </div>

          <div className="border-t border-white/[0.06] pt-6">
            <p className="mb-4 text-xs font-medium text-white/45">
              trip dates
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <MonthYearFields
                prefix="start"
                label="start"
              />

              <MonthYearFields
                prefix="end"
                label="end"
              />
            </div>
          </div>

          <div className="border-t border-white/[0.06] pt-6">
            <label
              htmlFor="notes"
              className="mb-2 block text-xs font-medium text-white/45"
            >
              notes
            </label>

            <textarea
              id="notes"
              name="notes"
              maxLength={
                5000
              }
              rows={5}
              placeholder="a few memories from this trip..."
              className="w-full resize-none rounded-xl border border-white/[0.09] bg-white/[0.045] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/20 hover:border-white/[0.13] focus:border-white/[0.22] focus:bg-white/[0.06]"
            />
          </div>
        </section>
      </div>

      <div className="mt-8 flex flex-col gap-3 border-t border-white/[0.07] pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {formError && (
            <p className="text-xs text-red-200/60">
              {formError}
            </p>
          )}
        </div>

        <SubmitButton
          disabled={
            places.length ===
            0
          }
        />
      </div>
    </form>
  );
}