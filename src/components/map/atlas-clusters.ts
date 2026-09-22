import {
  Marker,
  type GeoJSONSource,
  type Map as MapLibreMap,
} from "maplibre-gl";

const SOURCE_ID = "atlaslog-place-clusters";
const LAYER_ID = "atlaslog-place-clusters-carrier";
const MAX_CLUSTER_ZOOM = 12;

export type AtlasPoint = {
  id: string;
  longitude: number;
  latitude: number;
};

function createClusterElement(count: number) {
  const wrapper = document.createElement("div");
  const button = document.createElement("button");
  const label = `${count.toLocaleString("en")} locations — zoom in`;

  button.type = "button";
  button.className = "atlaslog-cluster-button";
  button.textContent = count.toLocaleString("en");
  button.title = label;
  button.setAttribute("aria-label", label);
  wrapper.appendChild(button);

  // A double click on a cluster must not also trigger the map's zoom handler.
  wrapper.addEventListener("dblclick", (event) => event.stopPropagation());

  return { wrapper, button };
}

/** Owns only the atlas markers and source; disposing never touches trip routes. */
export function createAtlasClusters(
  map: MapLibreMap,
  places: readonly AtlasPoint[],
  createPlaceMarker: (id: string) => Marker,
  onExpand: () => void,
): () => void {
  const markers = new Map<string, Marker>();
  const placeIds = new Set(places.map((place) => place.id));
  let disposed = false;
  let removed = false;
  let expansionRequest = 0;

  function clearMarkers() {
    markers.forEach((marker) => marker.remove());
    markers.clear();
  }

  async function expandCluster(
    source: GeoJSONSource,
    clusterId: number,
    center: [number, number],
  ) {
    const request = ++expansionRequest;
    onExpand();

    try {
      const zoom = await source.getClusterExpansionZoom(clusterId);

      // Worker responses can arrive after opening a trip or replacing the data.
      if (
        disposed ||
        request !== expansionRequest ||
        map.getSource(SOURCE_ID) !== source
      ) {
        return;
      }

      map.easeTo({
        center,
        zoom: Math.min(
          map.getMaxZoom(),
          Math.max(zoom, map.getZoom()),
        ),
        duration: 800,
      });
    } catch {
      // A style/source replacement invalidates cluster IDs while work is pending.
    }
  }

  function updateMarkers() {
    if (disposed) {
      return;
    }
    const source = map.getSource<GeoJSONSource>(SOURCE_ID);

    if (!source || !map.isSourceLoaded(SOURCE_ID)) {
      return;
    }

    const visible = new Set<string>();

    for (const feature of map.querySourceFeatures(SOURCE_ID)) {
      if (feature.geometry.type !== "Point") {
        continue;
      }

      const properties: Record<string, unknown> = feature.properties;
      const clusterId = properties.cluster_id;
      const count = properties.point_count;
      const placeId = properties.placeId;
      const isCluster = properties.cluster === true;

      if (
        isCluster
          ? typeof clusterId !== "number" || typeof count !== "number"
          : typeof placeId !== "string" || !placeIds.has(placeId)
      ) {
        continue;
      }

      const key = isCluster ? `cluster:${clusterId}` : `place:${placeId}`;

      // Buffered tiles can contain the same feature more than once.
      if (visible.has(key)) {
        continue;
      }
      visible.add(key);

      if (markers.has(key)) {
        continue;
      }

      if (isCluster && typeof clusterId === "number" && typeof count === "number") {
        const coordinates = feature.geometry.coordinates;
        const center: [number, number] = [coordinates[0], coordinates[1]];
        const { wrapper, button } = createClusterElement(count);

        button.addEventListener("click", (event) => {
          event.stopPropagation();
          void expandCluster(source, clusterId, center);
        });

        markers.set(
          key,
          new Marker({ element: wrapper, anchor: "center" })
            .setLngLat(center)
            .addTo(map),
        );
      } else if (typeof placeId === "string") {
        markers.set(key, createPlaceMarker(placeId).addTo(map));
      }
    }

    for (const [key, marker] of markers) {
      if (!visible.has(key)) {
        marker.remove();
        markers.delete(key);
      }
    }
  }

  function initialize() {
    if (disposed || map.getSource(SOURCE_ID)) {
      return;
    }

    clearMarkers();
    map.addSource(SOURCE_ID, {
      type: "geojson",
      cluster: true,
      clusterRadius: 64,
      clusterMaxZoom: MAX_CLUSTER_ZOOM,
      data: {
        type: "FeatureCollection",
        features: places.map((place) => ({
          type: "Feature",
          properties: { placeId: place.id },
          geometry: {
            type: "Point",
            coordinates: [place.longitude, place.latitude],
          },
        })),
      },
    });

    // Keep source tiles active for HTML markers without drawing a second symbol.
    // visibility:none would prevent the source from loading its visible tiles.
    map.addLayer({
      id: LAYER_ID,
      type: "circle",
      source: SOURCE_ID,
      paint: { "circle-radius": 0, "circle-opacity": 0 },
    });
  }

  function onRemove() {
    removed = true;
    dispose();
  }

  function dispose() {
    if (disposed) {
      return;
    }
    disposed = true;
    expansionRequest += 1;
    map.off("render", updateMarkers);
    map.off("style.load", initialize);
    map.off("idle", initialize);
    map.off("remove", onRemove);
    clearMarkers();

    if (!removed) {
      if (map.getLayer(LAYER_ID)) {
        map.removeLayer(LAYER_ID);
      }
      if (map.getSource(SOURCE_ID)) {
        map.removeSource(SOURCE_ID);
      }
    }
  }

  map.on("render", updateMarkers);
  map.on("style.load", initialize);
  map.on("remove", onRemove);

  if (map.isStyleLoaded()) {
    initialize();
  } else {
    // Also covers an already-loaded style with a source update still in flight.
    map.once("idle", initialize);
  }

  return dispose;
}
