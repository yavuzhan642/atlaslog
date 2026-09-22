import World from "@svg-maps/world";

type VisitedWorldMapProps = {
  countryCodes: string[];
};

type WorldLocation = {
  id: string;
  name: string;
  path: string;
};

type WorldMap = {
  label: string;
  viewBox: string;
  locations: WorldLocation[];
};

export function VisitedWorldMap({
  countryCodes,
}: VisitedWorldMapProps) {
  const visited = new Set(
    countryCodes.map((code) =>
      code.trim().toLowerCase(),
    ),
  );

  const world = World as WorldMap;

  return (
    <div className="relative overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#111318]">
      <div className="flex aspect-[1.8/1] w-full items-center justify-center p-3 sm:p-4">
        <svg
          viewBox={world.viewBox}
          role="img"
          aria-label="countries visited on your atlas"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {world.locations.map(
            (location) => {
              const isVisited =
                visited.has(
                  location.id.toLowerCase(),
                );

              return (
                <path
                  key={location.id}
                  d={location.path}
                  aria-label={location.name}
                  fill={
                    isVisited
                      ? "#f0efec"
                      : "#292c32"
                  }
                  stroke={
                    isVisited
                      ? "#6b6f78"
                      : "#454851"
                  }
                  strokeWidth={
                    isVisited
                      ? 0.7
                      : 0.55
                  }
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              );
            },
          )}
        </svg>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.035),transparent_55%)]" />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/15 to-transparent" />

      <a
        href="https://github.com/VictorCazanave/svg-maps"
        target="_blank"
        rel="noreferrer"
        className="absolute bottom-3 right-4 z-10 text-[9px] text-white/20 transition hover:text-white/40"
      >
        map · svg-maps
      </a>
    </div>
  );
}