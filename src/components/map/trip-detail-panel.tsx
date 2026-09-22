"use client";

import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronUp,
  LoaderCircle,
  MapPin,
  Pencil,
  Plus,
  Route,
  Search,
  Trash2,
  X,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

export type TripRouteMode =
  | "journey"
  | "road_trip"
  | "places_only";

export type TripPanelTrip = {
  id: string;
  title: string;
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
  route_mode: TripRouteMode;
  returns_to_start: boolean;
};

export type TripPanelPlace = {
  id: string;
  trip_id: string;

  kind:
    | "city"
    | "country"
    | "place";

  name: string;

  country_code: string | null;
  country_name: string | null;

  latitude: number | null;
  longitude: number | null;

  visit_order: number | null;
};

export type TripRouteStatus =
  | "idle"
  | "loading"
  | "ready"
  | "error";

type GeocodeResult = {
  id: string;
  name: string;
  label: string;

  kind:
    | "city"
    | "country";

  countryCode: string | null;
  countryName: string | null;

  latitude: number;
  longitude: number;
};

type MetadataSaveStatus =
  | "idle"
  | "pending"
  | "saving"
  | "saved"
  | "error";

type MetadataDraft = {
  title: string;
  notes: string;
  routeMode: TripRouteMode;
  returnsToStart: boolean;
};

type TripDetailPanelProps = {
  trip: TripPanelTrip;
  places: TripPanelPlace[];

  routeStatus:
    TripRouteStatus;

  onClose: () => void;

  onTripUpdated: (
    trip: TripPanelTrip,
  ) => void;

  onTripDeleted:
    () => void;

  onPlaceAdded: (
    place: TripPanelPlace,
  ) => void;

  onPlaceRemoved: (
    placeId: string,
  ) => void;

  onPlacesReordered: (
    places: TripPanelPlace[],
  ) => void;
};

function countryCodeToFlag(
  countryCode: string | null,
) {
  if (
    !countryCode ||
    countryCode.length !== 2
  ) {
    return "•";
  }

  return countryCode
    .toUpperCase()
    .split("")
    .map((character) =>
      String.fromCodePoint(
        127397 +
          character.charCodeAt(
            0,
          ),
      ),
    )
    .join("");
}

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
    new Date(
      `${value}T00:00:00`,
    ),
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

  if (
    start &&
    start === end
  ) {
    return start;
  }

  if (start && end) {
    return `${start} — ${end}`;
  }

  return start ?? end;
}

function routeModeLabel(
  mode: TripRouteMode,
) {
  if (
    mode === "road_trip"
  ) {
    return "road trip";
  }

  if (
    mode === "places_only"
  ) {
    return "places only";
  }

  return "journey";
}

export function TripDetailPanel({
  trip,
  places,
  routeStatus,
  onClose,
  onTripUpdated,
  onTripDeleted,
  onPlaceAdded,
  onPlaceRemoved,
  onPlacesReordered,
}: TripDetailPanelProps) {
  const [
    editing,
    setEditing,
  ] = useState(false);

  const [
    title,
    setTitle,
  ] = useState(
    trip.title,
  );

  const [
    notes,
    setNotes,
  ] = useState(
    trip.notes ?? "",
  );

  const [
    routeMode,
    setRouteMode,
  ] =
    useState<TripRouteMode>(
      trip.route_mode,
    );

  const [
    returnsToStart,
    setReturnsToStart,
  ] = useState(
    trip.returns_to_start,
  );

  const [
    metadataStatus,
    setMetadataStatus,
  ] =
    useState<MetadataSaveStatus>(
      "idle",
    );

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  const [
    query,
    setQuery,
  ] = useState("");

  const [
    searchResults,
    setSearchResults,
  ] =
    useState<
      GeocodeResult[]
    >([]);

  const [
    searching,
    setSearching,
  ] = useState(false);

  const [
    placeActionId,
    setPlaceActionId,
  ] =
    useState<
      string | null
    >(null);

  const [
    reordering,
    setReordering,
  ] = useState(false);

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

  const saveTimerRef =
    useRef<
      number | null
    >(null);

  const saveQueueRef =
    useRef<
      Promise<void>
    >(
      Promise.resolve(),
    );

  /*
   * While editing we do not
   * overwrite the local draft
   * when an autosave updates the
   * parent trip.
   */
  useEffect(() => {
    if (editing) {
      return;
    }

    setTitle(
      trip.title,
    );

    setNotes(
      trip.notes ?? "",
    );

    setRouteMode(
      trip.route_mode,
    );

    setReturnsToStart(
      trip.returns_to_start,
    );

    setMetadataStatus(
      "idle",
    );
  }, [
    trip,
    editing,
  ]);

  /*
   * A route with fewer than two
   * places cannot meaningfully
   * return to its starting point.
   */
  useEffect(() => {
    if (
      routeMode ===
        "places_only" ||
      places.length <= 1
    ) {
      setReturnsToStart(
        false,
      );
    }
  }, [
    routeMode,
    places.length,
  ]);

  useEffect(() => {
    const trimmed =
      query.trim();

    if (
      !editing ||
      trimmed.length < 2
    ) {
      setSearchResults(
        [],
      );

      setSearching(
        false,
      );

      return;
    }

    const controller =
      new AbortController();

    const timeout =
      window.setTimeout(
        async () => {
          setSearching(
            true,
          );

          setError(
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
              throw new Error();
            }

            const data =
              (await response.json()) as {
                results:
                  GeocodeResult[];
              };

            const filtered =
              data.results.filter(
                (result) =>
                  !places.some(
                    (place) =>
                      place.name
                        .trim()
                        .toLowerCase() ===
                        result.name
                          .trim()
                          .toLowerCase() &&
                      (place.country_code ??
                        "") ===
                        (result.countryCode ??
                          ""),
                  ),
              );

            setSearchResults(
              filtered,
            );
          } catch (
            requestError
          ) {
            if (
              requestError instanceof
                DOMException &&
              requestError.name ===
                "AbortError"
            ) {
              return;
            }

            setSearchResults(
              [],
            );

            setError(
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
    editing,
  ]);

  const tripPeriod =
    formatTripPeriod(
      trip.start_date,
      trip.end_date,
    );

  const persistMetadata =
    useCallback(
      async (
        draft: MetadataDraft,
      ) => {
        const cleanTitle =
          draft.title.trim();

        if (
          !cleanTitle
        ) {
          setError(
            "trip title is required.",
          );

          setMetadataStatus(
            "error",
          );

          return false;
        }

        const normalizedReturn =
          draft.routeMode !==
            "places_only" &&
          places.length > 1
            ? draft.returnsToStart
            : false;

        let successful =
          false;

        const run =
          async () => {
            setMetadataStatus(
              "saving",
            );

            try {
              const response =
                await fetch(
                  `/api/trips/${trip.id}`,
                  {
                    method:
                      "PATCH",

                    headers: {
                      "Content-Type":
                        "application/json",
                    },

                    body:
                      JSON.stringify({
                        title:
                          cleanTitle,

                        notes:
                          draft.notes,

                        routeMode:
                          draft.routeMode,

                        returnsToStart:
                          normalizedReturn,
                      }),
                  },
                );

              if (
                !response.ok
              ) {
                throw new Error();
              }

              const data =
                (await response.json()) as {
                  trip:
                    TripPanelTrip;
                };

              onTripUpdated(
                data.trip,
              );

              setMetadataStatus(
                "saved",
              );

              setError(
                null,
              );

              successful =
                true;
            } catch {
              setMetadataStatus(
                "error",
              );

              setError(
                "could not save trip changes.",
              );
            }
          };

        /*
         * Metadata writes are
         * serialized so an older
         * request can never finish
         * after a newer edit and
         * overwrite it.
         */
        const operation =
          saveQueueRef.current.then(
            run,
            run,
          );

        saveQueueRef.current =
          operation.then(
            () =>
              undefined,
            () =>
              undefined,
          );

        await operation;

        return successful;
      },
      [
        trip.id,
        places.length,
        onTripUpdated,
      ],
    );

  /*
   * Autosave title, notes,
   * route mode and return mode
   * after the user pauses.
   */
  useEffect(() => {
    if (!editing) {
      return;
    }

    if (
      saveTimerRef.current !==
      null
    ) {
      window.clearTimeout(
        saveTimerRef.current,
      );

      saveTimerRef.current =
        null;
    }

    const cleanTitle =
      title.trim();

    const normalizedReturn =
      routeMode !==
        "places_only" &&
      places.length > 1
        ? returnsToStart
        : false;

    const changed =
      cleanTitle !==
        trip.title ||
      notes !==
        (trip.notes ?? "") ||
      routeMode !==
        trip.route_mode ||
      normalizedReturn !==
        trip.returns_to_start;

    if (!changed) {
      return;
    }

    if (!cleanTitle) {
      setMetadataStatus(
        "error",
      );

      return;
    }

    setMetadataStatus(
      "pending",
    );

    saveTimerRef.current =
      window.setTimeout(
        () => {
          saveTimerRef.current =
            null;

          void persistMetadata({
            title,
            notes,
            routeMode,
            returnsToStart,
          });
        },
        650,
      );

    return () => {
      if (
        saveTimerRef.current !==
        null
      ) {
        window.clearTimeout(
          saveTimerRef.current,
        );

        saveTimerRef.current =
          null;
      }
    };
  }, [
    editing,
    title,
    notes,
    routeMode,
    returnsToStart,
    places.length,
    trip.title,
    trip.notes,
    trip.route_mode,
    trip.returns_to_start,
    persistMetadata,
  ]);

  async function flushMetadata() {
    if (
      saveTimerRef.current !==
      null
    ) {
      window.clearTimeout(
        saveTimerRef.current,
      );

      saveTimerRef.current =
        null;
    }

    const cleanTitle =
      title.trim();

    if (!cleanTitle) {
      setError(
        "trip title is required.",
      );

      setMetadataStatus(
        "error",
      );

      return false;
    }

    const normalizedReturn =
      routeMode !==
        "places_only" &&
      places.length > 1
        ? returnsToStart
        : false;

    const changed =
      cleanTitle !==
        trip.title ||
      notes !==
        (trip.notes ?? "") ||
      routeMode !==
        trip.route_mode ||
      normalizedReturn !==
        trip.returns_to_start;

    if (!changed) {
      await saveQueueRef.current;

      return (
        metadataStatus !==
        "error"
      );
    }

    return persistMetadata({
      title,
      notes,
      routeMode,
      returnsToStart,
    });
  }

  async function finishEditing() {
    const saved =
      await flushMetadata();

    if (!saved) {
      return;
    }

    setQuery("");

    setSearchResults(
      [],
    );

    setEditing(
      false,
    );
  }

  async function closePanel() {
    if (editing) {
      const saved =
        await flushMetadata();

      if (!saved) {
        return;
      }
    }

    onClose();
  }

  async function deleteTrip() {
    const confirmed =
      window.confirm(
        `delete "${trip.title}" permanently?`,
      );

    if (!confirmed) {
      return;
    }

    if (
      saveTimerRef.current !==
      null
    ) {
      window.clearTimeout(
        saveTimerRef.current,
      );

      saveTimerRef.current =
        null;
    }

    setDeleting(
      true,
    );

    setError(
      null,
    );

    try {
      const response =
        await fetch(
          `/api/trips/${trip.id}`,
          {
            method:
              "DELETE",
          },
        );

      if (
        !response.ok
      ) {
        throw new Error();
      }

      onTripDeleted();
    } catch {
      setError(
        "could not delete trip.",
      );
    } finally {
      setDeleting(
        false,
      );
    }
  }

  async function addPlace(
    result: GeocodeResult,
  ) {
    setPlaceActionId(
      result.id,
    );

    setError(
      null,
    );

    try {
      const response =
        await fetch(
          `/api/trips/${trip.id}/places`,
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                name:
                  result.name,

                kind:
                  result.kind,

                countryCode:
                  result.countryCode,

                countryName:
                  result.countryName,

                latitude:
                  result.latitude,

                longitude:
                  result.longitude,
              }),
          },
        );

      if (
        !response.ok
      ) {
        throw new Error();
      }

      const data =
        (await response.json()) as {
          place:
            TripPanelPlace;
        };

      onPlaceAdded(
        data.place,
      );

      setQuery("");

      setSearchResults(
        [],
      );
    } catch {
      setError(
        "could not add place.",
      );
    } finally {
      setPlaceActionId(
        null,
      );
    }
  }

  async function removePlace(
    place: TripPanelPlace,
  ) {
    if (
      places.length <= 1
    ) {
      setError(
        "a trip needs at least one place.",
      );

      return;
    }

    const confirmed =
      window.confirm(
        `remove ${place.name} from this trip?`,
      );

    if (!confirmed) {
      return;
    }

    setPlaceActionId(
      place.id,
    );

    setError(
      null,
    );

    try {
      const response =
        await fetch(
          `/api/trips/${trip.id}/places/${place.id}`,
          {
            method:
              "DELETE",
          },
        );

      if (
        !response.ok
      ) {
        throw new Error();
      }

      onPlaceRemoved(
        place.id,
      );
    } catch {
      setError(
        "could not remove place.",
      );
    } finally {
      setPlaceActionId(
        null,
      );
    }
  }

  async function movePlace(
    index: number,
    direction: -1 | 1,
  ) {
    const targetIndex =
      index +
      direction;

    if (
      targetIndex < 0 ||
      targetIndex >=
        places.length
    ) {
      return;
    }

    const reordered = [
      ...places,
    ];

    const current =
      reordered[index];

    reordered[index] =
      reordered[
        targetIndex
      ];

    reordered[
      targetIndex
    ] = current;

    const normalized =
      reordered.map(
        (
          place,
          placeIndex,
        ) => ({
          ...place,

          visit_order:
            placeIndex,
        }),
      );

    setReordering(
      true,
    );

    setError(
      null,
    );

    try {
      const response =
        await fetch(
          `/api/trips/${trip.id}/places/reorder`,
          {
            method:
              "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                placeIds:
                  normalized.map(
                    (place) =>
                      place.id,
                  ),
              }),
          },
        );

      if (
        !response.ok
      ) {
        throw new Error();
      }

      onPlacesReordered(
        normalized,
      );
    } catch {
      setError(
        "could not reorder places.",
      );
    } finally {
      setReordering(
        false,
      );
    }
  }

  return (
    <aside className="absolute bottom-4 left-4 right-4 z-30 max-h-[64%] overflow-y-auto rounded-[22px] border border-white/[0.1] bg-[#0b0e12]/95 p-5 shadow-2xl backdrop-blur-2xl md:bottom-auto md:left-auto md:right-5 md:top-20 md:max-h-[calc(100%-100px)] md:w-[360px]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium text-white/30">
            trip
          </p>

          {editing ? (
            <input
              value={
                title
              }
              onChange={(
                event,
              ) =>
                setTitle(
                  event
                    .target
                    .value,
                )
              }
              maxLength={
                120
              }
              className="mt-1 h-10 w-full rounded-xl border border-white/[0.09] bg-white/[0.04] px-3 text-sm font-medium text-white outline-none focus:border-white/[0.2]"
            />
          ) : (
            <h2 className="mt-1 truncate text-xl font-semibold tracking-[-0.035em] text-white">
              {
                trip.title
              }
            </h2>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {editing ? (
            <button
              type="button"
              aria-label="finish editing trip"
              disabled={
                metadataStatus ===
                "saving"
              }
              onClick={() =>
                void finishEditing()
              }
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-white/45 transition hover:bg-white/[0.07] hover:text-white disabled:opacity-40"
            >
              {metadataStatus ===
              "saving" ? (
                <LoaderCircle
                  size={15}
                  className="animate-spin"
                />
              ) : (
                <Check
                  size={16}
                />
              )}
            </button>
          ) : (
            <button
              type="button"
              aria-label="edit trip"
              onClick={() => {
                setEditing(
                  true,
                );

                setError(
                  null,
                );

                setMetadataStatus(
                  "idle",
                );
              }}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-white/45 transition hover:bg-white/[0.07] hover:text-white"
            >
              <Pencil
                size={15}
              />
            </button>
          )}

          <button
            type="button"
            aria-label="close trip details"
            onClick={() =>
              void closePanel()
            }
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-white/45 transition hover:bg-white/[0.07] hover:text-white"
          >
            <X
              size={16}
            />
          </button>
        </div>
      </div>

      {tripPeriod && (
        <div className="mt-4 flex items-center gap-2 text-xs text-white/40">
          <CalendarDays
            size={14}
            strokeWidth={
              1.7
            }
          />

          <span>
            {tripPeriod}
          </span>
        </div>
      )}

      {!editing && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-white/35">
          <Route
            size={14}
            strokeWidth={
              1.7
            }
          />

          <span>
            {routeModeLabel(
              trip.route_mode,
            )}
          </span>

          {trip.returns_to_start && (
            <>
              <span>
                ·
              </span>

              <span>
                returns to start
              </span>
            </>
          )}

          {trip.route_mode ===
            "road_trip" &&
            routeStatus ===
              "loading" && (
              <>
                <span>
                  ·
                </span>

                <span className="text-white/25">
                  calculating
                  route…
                </span>
              </>
            )}

          {trip.route_mode ===
            "road_trip" &&
            routeStatus ===
              "error" && (
              <>
                <span>
                  ·
                </span>

                <span className="text-white/25">
                  route
                  unavailable
                </span>
              </>
            )}
        </div>
      )}

      {editing ? (
        <div className="mt-5 space-y-5">
          <div>
            <label className="mb-2 block text-[11px] text-white/35">
              notes
            </label>

            <textarea
              value={
                notes
              }
              onChange={(
                event,
              ) =>
                setNotes(
                  event
                    .target
                    .value,
                )
              }
              rows={3}
              maxLength={
                5000
              }
              className="w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 py-3 text-sm leading-6 text-white outline-none focus:border-white/[0.18]"
            />
          </div>

          <div>
            <p className="mb-2 text-[11px] text-white/35">
              route style
            </p>

            <div className="grid grid-cols-3 gap-1.5">
              {(
                [
                  [
                    "journey",
                    "journey",
                  ],

                  [
                    "road_trip",
                    "road trip",
                  ],

                  [
                    "places_only",
                    "places",
                  ],
                ] as const
              ).map(
                ([
                  value,
                  label,
                ]) => (
                  <button
                    key={
                      value
                    }
                    type="button"
                    onClick={() => {
                      setRouteMode(
                        value,
                      );

                      if (
                        value ===
                        "places_only"
                      ) {
                        setReturnsToStart(
                          false,
                        );
                      }
                    }}
                    className={[
                      "h-9 rounded-lg border text-[11px] transition",

                      routeMode ===
                      value
                        ? "border-white/[0.18] bg-white/[0.09] text-white/80"
                        : "border-white/[0.07] bg-white/[0.025] text-white/35 hover:text-white/60",
                    ].join(
                      " ",
                    )}
                  >
                    {
                      label
                    }
                  </button>
                ),
              )}
            </div>
          </div>

          {routeMode !==
            "places_only" &&
            places.length >
              1 && (
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-3">
                <input
                  type="checkbox"
                  checked={
                    returnsToStart
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

                <span className="text-xs text-white/55">
                  return to{" "}
                  {
                    places[0]
                      ?.name
                  }
                </span>
              </label>
            )}
        </div>
      ) : (
        trip.notes && (
          <p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-white/45">
            {
              trip.notes
            }
          </p>
        )
      )}

      <div className="mt-6 border-t border-white/[0.07] pt-5">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-medium text-white/30">
            route
          </p>

          <span className="text-[11px] tabular-nums text-white/25">
            {
              places.length
            }{" "}
            places
          </span>
        </div>

        {editing && (
          <div className="relative mt-3">
            <Search
              size={15}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
            />

            <input
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
              placeholder="add a city or country"
              autoComplete="off"
              className="h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.035] pl-10 pr-10 text-sm text-white outline-none placeholder:text-white/20 focus:border-white/[0.18]"
            />

            {searching && (
              <LoaderCircle
                size={15}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-white/30"
              />
            )}

            {searchResults.length >
              0 && (
              <div className="absolute inset-x-0 top-[50px] z-50 overflow-hidden rounded-xl border border-white/[0.09] bg-[#111419]/95 p-1.5 shadow-2xl backdrop-blur-2xl">
                {searchResults.map(
                  (
                    result,
                  ) => (
                    <button
                      key={
                        result.id
                      }
                      type="button"
                      disabled={
                        placeActionId !==
                        null
                      }
                      onClick={() =>
                        void addPlace(
                          result,
                        )
                      }
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-white/[0.06] disabled:opacity-50"
                    >
                      <MapPin
                        size={
                          14
                        }
                        className="shrink-0 text-white/35"
                      />

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-white/75">
                          {
                            result.name
                          }
                        </p>

                        <p className="mt-0.5 truncate text-[11px] text-white/30">
                          {
                            result.label
                          }
                        </p>
                      </div>

                      {placeActionId ===
                      result.id ? (
                        <LoaderCircle
                          size={
                            14
                          }
                          className="animate-spin text-white/35"
                        />
                      ) : (
                        <Plus
                          size={
                            14
                          }
                          className="text-white/35"
                        />
                      )}
                    </button>
                  ),
                )}
              </div>
            )}
          </div>
        )}

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
                className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.04] text-[11px] font-medium tabular-nums text-white/40">
                  {index +
                    1}
                </div>

                <div className="flex h-8 w-8 shrink-0 items-center justify-center text-lg">
                  {countryCodeToFlag(
                    place.country_code,
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white/75">
                    {
                      place.name
                    }
                  </p>

                  {place.country_name && (
                    <p className="mt-0.5 truncate text-[11px] text-white/25">
                      {
                        place.country_name
                      }
                    </p>
                  )}
                </div>

                {editing && (
                  <div className="flex shrink-0 items-center gap-0.5">
                    <button
                      type="button"
                      disabled={
                        index ===
                          0 ||
                        reordering
                      }
                      aria-label={`move ${place.name} up`}
                      onClick={() =>
                        void movePlace(
                          index,
                          -1,
                        )
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 transition hover:bg-white/[0.06] hover:text-white/70 disabled:opacity-20"
                    >
                      <ChevronUp
                        size={
                          14
                        }
                      />
                    </button>

                    <button
                      type="button"
                      disabled={
                        index ===
                          places.length -
                            1 ||
                        reordering
                      }
                      aria-label={`move ${place.name} down`}
                      onClick={() =>
                        void movePlace(
                          index,
                          1,
                        )
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 transition hover:bg-white/[0.06] hover:text-white/70 disabled:opacity-20"
                    >
                      <ChevronDown
                        size={
                          14
                        }
                      />
                    </button>

                    <button
                      type="button"
                      disabled={
                        placeActionId !==
                          null ||
                        places.length <=
                          1
                      }
                      aria-label={`remove ${place.name}`}
                      onClick={() =>
                        void removePlace(
                          place,
                        )
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 transition hover:bg-red-400/[0.08] hover:text-red-200 disabled:opacity-20"
                    >
                      {placeActionId ===
                      place.id ? (
                        <LoaderCircle
                          size={
                            13
                          }
                          className="animate-spin"
                        />
                      ) : (
                        <X
                          size={
                            14
                          }
                        />
                      )}
                    </button>
                  </div>
                )}
              </div>
            ),
          )}

          {trip.returns_to_start &&
            !editing &&
            places.length >
              1 && (
              <div className="flex items-center gap-3 rounded-xl border border-dashed border-white/[0.07] px-3 py-3">
                <div className="flex h-8 w-8 items-center justify-center text-[11px] text-white/30">
                  ↩
                </div>

                <MapPin
                  size={15}
                  className="text-white/30"
                />

                <p className="text-sm text-white/45">
                  back to{" "}
                  {
                    places[0]
                      .name
                  }
                </p>
              </div>
            )}
        </div>
      </div>

      {error && (
        <p className="mt-4 text-xs text-red-200/60">
          {error}
        </p>
      )}

      {editing && (
        <div className="mt-6 flex items-center justify-between border-t border-white/[0.07] pt-5">
          <button
            type="button"
            disabled={
              deleting
            }
            onClick={() =>
              void deleteTrip()
            }
            className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-xs text-red-300/55 transition hover:bg-red-400/[0.08] hover:text-red-200 disabled:opacity-40"
          >
            {deleting ? (
              <LoaderCircle
                size={13}
                className="animate-spin"
              />
            ) : (
              <Trash2
                size={13}
              />
            )}

            delete trip
          </button>

          <div className="flex h-9 items-center gap-2 px-2 text-[10px]">
            {metadataStatus ===
              "pending" && (
              <span className="text-white/20">
                waiting to
                save…
              </span>
            )}

            {metadataStatus ===
              "saving" && (
              <>
                <LoaderCircle
                  size={12}
                  className="animate-spin text-white/25"
                />

                <span className="text-white/25">
                  saving…
                </span>
              </>
            )}

            {metadataStatus ===
              "saved" && (
              <>
                <Check
                  size={12}
                  className="text-white/30"
                />

                <span className="text-white/30">
                  saved
                </span>
              </>
            )}

            {metadataStatus ===
              "error" && (
              <span className="text-red-200/45">
                not saved
              </span>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}