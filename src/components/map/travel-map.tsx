"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  AttributionControl,
  LngLatBounds,
  Map as MapLibreMap,
  Marker,
  Popup,
  setWorkerUrl,
} from "maplibre-gl";

import {
  TripDetailPanel,
  type TripPanelPlace,
  type TripPanelTrip,
  type TripRouteStatus,
} from "@/components/map/trip-detail-panel";

import { createClient } from "@/lib/supabase/client";

setWorkerUrl(
  "/maplibre/maplibre-gl-worker.mjs",
);

const ROUTE_SOURCE_ID =
  "atlaslog-trip-route";

const ROUTE_CASING_LAYER_ID =
  "atlaslog-trip-route-casing";

const ROUTE_LINE_LAYER_ID =
  "atlaslog-trip-route-line";

type RouteGeoJSON = {
  type: "FeatureCollection";

  features: Array<{
    type: "Feature";

    properties:
      | Record<string, unknown>
      | null;

    geometry: {
      type: "LineString";

      coordinates: [
        number,
        number,
      ][];
    };
  }>;
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
          character.charCodeAt(0),
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

function removeTripRoute(
  map: MapLibreMap,
) {
  if (
    map.getLayer(
      ROUTE_LINE_LAYER_ID,
    )
  ) {
    map.removeLayer(
      ROUTE_LINE_LAYER_ID,
    );
  }

  if (
    map.getLayer(
      ROUTE_CASING_LAYER_ID,
    )
  ) {
    map.removeLayer(
      ROUTE_CASING_LAYER_ID,
    );
  }

  if (
    map.getSource(
      ROUTE_SOURCE_ID,
    )
  ) {
    map.removeSource(
      ROUTE_SOURCE_ID,
    );
  }
}

function drawTripRoute(
  map: MapLibreMap,
  geojson: RouteGeoJSON,
) {
  removeTripRoute(map);

  map.addSource(
    ROUTE_SOURCE_ID,
    {
      type: "geojson",
      data: geojson,
    },
  );

  map.addLayer({
    id: ROUTE_CASING_LAYER_ID,

    type: "line",

    source: ROUTE_SOURCE_ID,

    layout: {
      "line-cap": "round",
      "line-join": "round",
    },

    paint: {
      "line-color":
        "rgba(0, 0, 0, 0.58)",

      "line-width": 7,

      "line-opacity": 0.72,

      "line-blur": 1.2,
    },
  });

  map.addLayer({
    id: ROUTE_LINE_LAYER_ID,

    type: "line",

    source: ROUTE_SOURCE_ID,

    layout: {
      "line-cap": "round",
      "line-join": "round",
    },

    paint: {
      "line-color":
        "rgba(242, 244, 245, 0.9)",

      "line-width": 3,

      "line-opacity": 0.92,

      "line-blur": 0.2,
    },
  });
}

function buildJourneyRoute(
  places: TripPanelPlace[],
  returnsToStart: boolean,
): RouteGeoJSON | null {
  const coordinates = places
    .filter(
      (
        place,
      ): place is TripPanelPlace & {
        latitude: number;
        longitude: number;
      } =>
        place.latitude !== null &&
        place.longitude !== null,
    )
    .map(
      (place) =>
        [
          place.longitude,
          place.latitude,
        ] as [number, number],
    );

  if (coordinates.length < 2) {
    return null;
  }

  if (returnsToStart) {
    coordinates.push([
      coordinates[0][0],
      coordinates[0][1],
    ]);
  }

  return {
    type: "FeatureCollection",

    features: [
      {
        type: "Feature",

        properties: {
          route_mode:
            "journey",
        },

        geometry: {
          type: "LineString",
          coordinates,
        },
      },
    ],
  };
}

function drawJourneyRoute(
  map: MapLibreMap,
  geojson: RouteGeoJSON,
) {
  removeTripRoute(map);

  map.addSource(
    ROUTE_SOURCE_ID,
    {
      type: "geojson",
      data: geojson,
    },
  );

  map.addLayer({
    id: ROUTE_CASING_LAYER_ID,

    type: "line",

    source: ROUTE_SOURCE_ID,

    layout: {
      "line-cap": "round",
      "line-join": "round",
    },

    paint: {
      "line-color":
        "rgba(0, 0, 0, 0.48)",

      "line-width": 5,

      "line-opacity": 0.65,

      "line-blur": 1,
    },
  });

  map.addLayer({
    id: ROUTE_LINE_LAYER_ID,

    type: "line",

    source: ROUTE_SOURCE_ID,

    layout: {
      "line-cap": "round",
      "line-join": "round",
    },

    paint: {
      "line-color":
        "rgba(242, 244, 245, 0.82)",

      "line-width": 2.4,

      "line-opacity": 0.9,

      "line-dasharray": [
        2.2,
        1.5,
      ],
    },
  });
}

function createMarkerElement(
  place: TripPanelPlace,
) {
  const wrapper =
    document.createElement("div");

  const button =
    document.createElement("button");

  button.type = "button";

  button.title = place.name;

  button.setAttribute(
    "aria-label",
    `open ${place.name}`,
  );

  button.textContent =
    countryCodeToFlag(
      place.country_code,
    );

  Object.assign(button.style, {
    width: "36px",

    height: "36px",

    borderRadius: "12px",

    border:
      "1px solid rgba(255, 255, 255, 0.20)",

    background:
      "rgba(10, 13, 17, 0.88)",

    backdropFilter:
      "blur(18px)",

    WebkitBackdropFilter:
      "blur(18px)",

    boxShadow:
      "0 9px 26px rgba(0, 0, 0, 0.30), inset 0 1px 0 rgba(255, 255, 255, 0.05)",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    padding: "0",

    fontSize: "18px",

    lineHeight: "1",

    cursor: "pointer",

    userSelect: "none",

    outline: "none",

    transition:
      "transform 160ms ease, border-color 160ms ease, background 160ms ease",
  });

  button.addEventListener(
    "mouseenter",
    () => {
      button.style.transform =
        "scale(1.07)";

      button.style.borderColor =
        "rgba(255, 255, 255, 0.38)";

      button.style.background =
        "rgba(15, 18, 23, 0.95)";
    },
  );

  button.addEventListener(
    "mouseleave",
    () => {
      button.style.transform =
        "scale(1)";

      button.style.borderColor =
        "rgba(255, 255, 255, 0.20)";

      button.style.background =
        "rgba(10, 13, 17, 0.88)";
    },
  );

  wrapper.appendChild(button);

  return {
    wrapper,
    button,
  };
}

function focusPlaces(
  map: MapLibreMap,
  places: TripPanelPlace[],
  panelOpen = false,
) {
  const validPlaces =
    places.filter(
      (
        place,
      ): place is TripPanelPlace & {
        latitude: number;
        longitude: number;
      } =>
        place.latitude !== null &&
        place.longitude !== null,
    );

  if (
    validPlaces.length === 0
  ) {
    return;
  }

  if (
    validPlaces.length === 1
  ) {
    map.easeTo({
      center: [
        validPlaces[0]
          .longitude,

        validPlaces[0]
          .latitude,
      ],

      zoom: 7,

      duration: 900,
    });

    return;
  }

  const first =
    validPlaces[0];

  const bounds =
    new LngLatBounds(
      [
        first.longitude,
        first.latitude,
      ],

      [
        first.longitude,
        first.latitude,
      ],
    );

  for (
    const place
    of validPlaces.slice(1)
  ) {
    bounds.extend([
      place.longitude,
      place.latitude,
    ]);
  }

  const mobile =
    window.innerWidth < 768;

  map.fitBounds(
    bounds,
    {
      padding: mobile
        ? {
            top: 90,
            right: 55,
            bottom: 170,
            left: 55,
          }
        : {
            top: 110,

            right: panelOpen
              ? 450
              : 110,

            bottom: 110,

            left: 110,
          },

      maxZoom: 7,

      duration: 1000,
    },
  );
}

function stylePopup(
  popup: Popup,
) {
  const root =
    popup.getElement();

  const content =
    root.querySelector<HTMLElement>(
      ".maplibregl-popup-content",
    );

  if (content) {
    Object.assign(
      content.style,
      {
        padding: "0",

        background:
          "transparent",

        boxShadow: "none",

        borderRadius:
          "17px",
      },
    );
  }

  const tip =
    root.querySelector<HTMLElement>(
      ".maplibregl-popup-tip",
    );

  if (tip) {
    tip.style.display =
      "none";
  }
}

function createTripCard(
  place: TripPanelPlace,
  trip: TripPanelTrip,
  openDetails: () => void,
) {
  const card =
    document.createElement(
      "div",
    );

  Object.assign(
    card.style,
    {
      width: "270px",

      padding: "15px",

      borderRadius:
        "17px",

      border:
        "1px solid rgba(255, 255, 255, 0.12)",

      background:
        "rgba(10, 13, 17, 0.96)",

      backdropFilter:
        "blur(22px)",

      WebkitBackdropFilter:
        "blur(22px)",

      boxShadow:
        "0 22px 60px rgba(0, 0, 0, 0.45)",

      color: "#ffffff",

      fontFamily:
        '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif',
    },
  );

  const placeRow =
    document.createElement(
      "div",
    );

  Object.assign(
    placeRow.style,
    {
      display: "flex",

      alignItems:
        "center",

      gap: "9px",
    },
  );

  const flag =
    document.createElement(
      "div",
    );

  flag.textContent =
    countryCodeToFlag(
      place.country_code,
    );

  Object.assign(
    flag.style,
    {
      width: "32px",

      height: "32px",

      borderRadius:
        "10px",

      display: "flex",

      alignItems:
        "center",

      justifyContent:
        "center",

      background:
        "rgba(255, 255, 255, 0.06)",

      border:
        "1px solid rgba(255, 255, 255, 0.08)",

      fontSize:
        "17px",
    },
  );

  const placeText =
    document.createElement(
      "div",
    );

  const placeName =
    document.createElement(
      "div",
    );

  placeName.textContent =
    place.name;

  Object.assign(
    placeName.style,
    {
      fontSize:
        "13px",

      fontWeight:
        "600",

      color:
        "rgba(255, 255, 255, 0.9)",
    },
  );

  const country =
    document.createElement(
      "div",
    );

  country.textContent =
    place.country_name ??
    "";

  Object.assign(
    country.style,
    {
      marginTop:
        "2px",

      fontSize:
        "11px",

      color:
        "rgba(255, 255, 255, 0.38)",
    },
  );

  placeText.append(
    placeName,
    country,
  );

  placeRow.append(
    flag,
    placeText,
  );

  const divider =
    document.createElement(
      "div",
    );

  Object.assign(
    divider.style,
    {
      height: "1px",

      margin:
        "13px 0",

      background:
        "rgba(255, 255, 255, 0.08)",
    },
  );

  const title =
    document.createElement(
      "div",
    );

  title.textContent =
    trip.title;

  Object.assign(
    title.style,
    {
      fontSize:
        "16px",

      lineHeight:
        "1.35",

      fontWeight:
        "600",

      letterSpacing:
        "-0.02em",

      color:
        "rgba(255, 255, 255, 0.96)",
    },
  );

  const tripPeriod =
    formatTripPeriod(
      trip.start_date,
      trip.end_date,
    );

  const date =
    document.createElement(
      "div",
    );

  if (tripPeriod) {
    date.textContent =
      tripPeriod;

    Object.assign(
      date.style,
      {
        marginTop:
          "7px",

        fontSize:
          "11px",

        color:
          "rgba(255, 255, 255, 0.4)",
      },
    );
  }

  const notes =
    document.createElement(
      "div",
    );

  if (trip.notes) {
    notes.textContent =
      trip.notes;

    Object.assign(
      notes.style,
      {
        marginTop:
          "11px",

        fontSize:
          "12px",

        lineHeight:
          "1.55",

        color:
          "rgba(255, 255, 255, 0.48)",

        display:
          "-webkit-box",

        WebkitBoxOrient:
          "vertical",

        WebkitLineClamp:
          "2",

        overflow:
          "hidden",
      },
    );
  }

  const button =
    document.createElement(
      "button",
    );

  button.type = "button";

  button.textContent =
    "trip details";

  Object.assign(
    button.style,
    {
      display:
        "inline-flex",

      alignItems:
        "center",

      marginTop:
        "14px",

      padding:
        "8px 11px",

      borderRadius:
        "10px",

      background:
        "rgba(255, 255, 255, 0.09)",

      border:
        "1px solid rgba(255, 255, 255, 0.08)",

      color:
        "rgba(255, 255, 255, 0.82)",

      fontSize:
        "11px",

      fontWeight:
        "500",

      cursor:
        "pointer",
    },
  );

  button.addEventListener(
    "click",
    (event) => {
      event.stopPropagation();

      openDetails();
    },
  );

  card.append(
    placeRow,
    divider,
    title,
  );

  if (tripPeriod) {
    card.append(date);
  }

  if (trip.notes) {
    card.append(notes);
  }

  card.append(button);

  return card;
}

export function TravelMap() {
  const containerRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const mapRef =
    useRef<MapLibreMap | null>(
      null,
    );

  const popupRef =
    useRef<Popup | null>(
      null,
    );

  const markersRef =
    useRef(
      new globalThis.Map<
        string,
        Marker
      >(),
    );

  const [
    mapReady,
    setMapReady,
  ] =
    useState(false);

  const [
    trips,
    setTrips,
  ] =
    useState<
      TripPanelTrip[]
    >([]);

  const [
    places,
    setPlaces,
  ] =
    useState<
      TripPanelPlace[]
    >([]);

  const [
    selectedTripId,
    setSelectedTripId,
  ] =
    useState<
      string | null
    >(null);

  const [
    routeStatus,
    setRouteStatus,
  ] =
    useState<TripRouteStatus>(
      "idle",
    );

  useEffect(() => {
    if (
      !containerRef.current
    ) {
      return;
    }

    const apiKey =
      process.env
        .NEXT_PUBLIC_MAPTILER_KEY;

    if (!apiKey) {
      console.error(
        "atlaslog map error: NEXT_PUBLIC_MAPTILER_KEY is missing",
      );

      return;
    }

    const map =
      new MapLibreMap({
        container:
          containerRef.current,

        style: `https://api.maptiler.com/maps/dataviz-v4-dark/style.json?key=${apiKey}`,

        center: [
          18,
          45,
        ],

        zoom: 3.25,

        pitch: 0,

        bearing: 0,

        maxPitch: 0,

        renderWorldCopies:
          false,

        attributionControl:
          false,

        canvasContextAttributes: {
          antialias: true,
        },
      });

    mapRef.current =
      map;

    map.dragRotate.disable();

    map.touchZoomRotate.disableRotation();

    map.addControl(
      new AttributionControl({
        compact: true,
      }),
      "bottom-right",
    );

    popupRef.current =
      new Popup({
        closeButton:
          false,

        closeOnClick:
          true,

        offset: 24,

        maxWidth:
          "320px",
      });

    setMapReady(true);

    return () => {
      popupRef.current?.remove();

      markersRef.current.forEach(
        (marker) => {
          marker.remove();
        },
      );

      markersRef.current.clear();

      if (
        map.isStyleLoaded()
      ) {
        removeTripRoute(
          map,
        );
      }

      map.remove();

      mapRef.current =
        null;

      setMapReady(false);
    };
  }, []);

  useEffect(() => {
    const supabase =
      createClient();

    async function loadData() {
      const [
        tripsResponse,
        placesResponse,
      ] =
        await Promise.all([
          supabase
            .from("trips")
            .select(
              "id, title, start_date, end_date, notes, route_mode, returns_to_start",
            )
            .order(
              "created_at",
              {
                ascending:
                  false,
              },
            ),

          supabase
            .from(
              "trip_places",
            )
            .select(
              "id, trip_id, kind, name, country_code, country_name, latitude, longitude, visit_order",
            )
            .order(
              "visit_order",
              {
                ascending:
                  true,
              },
            ),
        ]);

      if (
        tripsResponse.error
      ) {
        console.error(
          "atlaslog trips error:",
          tripsResponse.error,
        );

        return;
      }

      if (
        placesResponse.error
      ) {
        console.error(
          "atlaslog places error:",
          placesResponse.error,
        );

        return;
      }

      setTrips(
        (tripsResponse.data ??
          []) as TripPanelTrip[],
      );

      setPlaces(
        (placesResponse.data ??
          []) as TripPanelPlace[],
      );
    }

    void loadData();
  }, []);

  useEffect(() => {
    const map =
      mapRef.current;

    const popup =
      popupRef.current;

    if (
      !mapReady ||
      !map ||
      !popup
    ) {
      return;
    }

    markersRef.current.forEach(
      (marker) => {
        marker.remove();
      },
    );

    markersRef.current.clear();

    const tripMap =
      new globalThis.Map<
        string,
        TripPanelTrip
      >();

    for (
      const trip
      of trips
    ) {
      tripMap.set(
        trip.id,
        trip,
      );
    }

    for (
      const place
      of places
    ) {
      if (
        place.latitude ===
          null ||
        place.longitude ===
          null
      ) {
        continue;
      }

      const trip =
        tripMap.get(
          place.trip_id,
        );

      if (!trip) {
        continue;
      }

      const {
        wrapper,
        button,
      } =
        createMarkerElement(
          place,
        );

      button.addEventListener(
        "click",
        (event) => {
          event.stopPropagation();

          popup
            .setLngLat([
              place.longitude!,
              place.latitude!,
            ])
            .setDOMContent(
              createTripCard(
                place,
                trip,
                () => {
                  popup.remove();

                  setSelectedTripId(
                    trip.id,
                  );
                },
              ),
            )
            .addTo(map);

          stylePopup(
            popup,
          );
        },
      );

      const marker =
        new Marker({
          element:
            wrapper,

          anchor:
            "center",
        })
          .setLngLat([
            place.longitude,
            place.latitude,
          ])
          .addTo(map);

      markersRef.current.set(
        place.id,
        marker,
      );
    }
  }, [
    mapReady,
    places,
    trips,
  ]);

  const selectedTrip =
    useMemo(() => {
      if (
        !selectedTripId
      ) {
        return null;
      }

      return (
        trips.find(
          (trip) =>
            trip.id ===
            selectedTripId,
        ) ?? null
      );
    }, [
      selectedTripId,
      trips,
    ]);

  const selectedPlaces =
    useMemo(() => {
      if (
        !selectedTripId
      ) {
        return [];
      }

      return places
        .filter(
          (place) =>
            place.trip_id ===
            selectedTripId,
        )
        .sort(
          (a, b) =>
            (a.visit_order ??
              0) -
            (b.visit_order ??
              0),
        );
    }, [
      selectedTripId,
      places,
    ]);

  useEffect(() => {
    const map =
      mapRef.current;

    if (
      !mapReady ||
      !map ||
      places.length === 0
    ) {
      return;
    }

    const run =
      () => {
        if (
          selectedTripId
        ) {
          focusPlaces(
            map,
            selectedPlaces,
            true,
          );
        } else {
          focusPlaces(
            map,
            places,
            false,
          );
        }
      };

    if (map.loaded()) {
      run();
    } else {
      map.once(
        "load",
        run,
      );

      return () => {
        map.off(
          "load",
          run,
        );
      };
    }
  }, [
    mapReady,
    selectedTripId,
    selectedPlaces,
    places,
  ]);

  useEffect(() => {
    const activeMap =
      mapRef.current;

    if (!activeMap) {
      return;
    }

    if (
      activeMap.isStyleLoaded()
    ) {
      removeTripRoute(
        activeMap,
      );
    }

    setRouteStatus(
      "idle",
    );

    if (
      !selectedTrip ||
      selectedPlaces.length < 2
    ) {
      return;
    }

    if (
      selectedTrip.route_mode ===
      "places_only"
    ) {
      return;
    }

    if (
      selectedTrip.route_mode ===
      "journey"
    ) {
      const geojson =
        buildJourneyRoute(
          selectedPlaces,
          selectedTrip.returns_to_start,
        );

      if (!geojson) {
        return;
      }

      const renderJourney =
        () => {
          drawJourneyRoute(
            activeMap,
            geojson,
          );

          setRouteStatus(
            "ready",
          );
        };

      if (
        activeMap.isStyleLoaded()
      ) {
        renderJourney();
      } else {
        activeMap.once(
          "load",
          renderJourney,
        );

        return () => {
          activeMap.off(
            "load",
            renderJourney,
          );
        };
      }

      return;
    }

    if (
      selectedTrip.route_mode !==
      "road_trip"
    ) {
      return;
    }

    let cancelled =
      false;

    async function loadRoadRoute(
      map: MapLibreMap,
      tripId: string,
    ) {
      setRouteStatus(
        "loading",
      );

      try {
        const response =
          await fetch(
            `/api/trips/${tripId}/route`,
            {
              cache:
                "no-store",
            },
          );

        if (
          !response.ok
        ) {
          throw new Error(
            "route request failed",
          );
        }

        const geojson =
          (await response.json()) as RouteGeoJSON;

        if (cancelled) {
          return;
        }

        const render =
          () => {
            if (
              cancelled
            ) {
              return;
            }

            drawTripRoute(
              map,
              geojson,
            );

            setRouteStatus(
              "ready",
            );
          };

        if (
          map.isStyleLoaded()
        ) {
          render();
        } else {
          map.once(
            "load",
            render,
          );
        }
      } catch (error) {
        if (
          cancelled
        ) {
          return;
        }

        console.error(
          "atlaslog road route error:",
          error,
        );

        setRouteStatus(
          "error",
        );
      }
    }

    void loadRoadRoute(
      activeMap,
      selectedTrip.id,
    );

    return () => {
      cancelled =
        true;
    };
  }, [
    selectedTrip,
    selectedPlaces,
  ]);

  function closePanel() {
    const map =
      mapRef.current;

    setSelectedTripId(
      null,
    );

    setRouteStatus(
      "idle",
    );

    if (!map) {
      return;
    }

    if (
      map.isStyleLoaded()
    ) {
      removeTripRoute(
        map,
      );
    }

    window.requestAnimationFrame(
      () => {
        focusPlaces(
          map,
          places,
          false,
        );
      },
    );
  }

  return (
    <>
      <div
        ref={containerRef}
        className="absolute inset-0"
        style={{
          position:
            "absolute",

          inset: 0,
        }}
        aria-label="atlaslog travel map"
      />

      {selectedTrip && (
        <TripDetailPanel
          trip={
            selectedTrip
          }
          places={
            selectedPlaces
          }
          routeStatus={
            routeStatus
          }
          onClose={
            closePanel
          }
          onTripUpdated={(
            updatedTrip,
          ) => {
            setTrips(
              (current) =>
                current.map(
                  (trip) =>
                    trip.id ===
                    updatedTrip.id
                      ? updatedTrip
                      : trip,
                ),
            );
          }}
          onTripDeleted={() => {
            setTrips(
              (current) =>
                current.filter(
                  (trip) =>
                    trip.id !==
                    selectedTrip.id,
                ),
            );

            setPlaces(
              (current) =>
                current.filter(
                  (place) =>
                    place.trip_id !==
                    selectedTrip.id,
                ),
            );

            closePanel();
          }}
          onPlaceAdded={(
            place,
          ) => {
            setPlaces(
              (current) => [
                ...current,
                place,
              ],
            );
          }}
          onPlaceRemoved={(
            placeId,
          ) => {
            setPlaces(
              (current) =>
                current.filter(
                  (place) =>
                    place.id !==
                    placeId,
                ),
            );
          }}
          onPlacesReordered={(
            reorderedPlaces,
          ) => {
            const updatedIds =
              new Set(
                reorderedPlaces.map(
                  (place) =>
                    place.id,
                ),
              );

            setPlaces(
              (current) => [
                ...current.filter(
                  (place) =>
                    !updatedIds.has(
                      place.id,
                    ),
                ),

                ...reorderedPlaces,
              ],
            );
          }}
        />
      )}
    </>
  );
}