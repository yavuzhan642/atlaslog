import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

type MapTilerContext = {
  id?: string;
  text?: string;
  country_code?: string;
  short_code?: string;
  place_designation?: string;
};

type MapTilerFeature = {
  id: string;
  text: string;
  matching_text?: string;
  place_name: string;
  matching_place_name?: string;
  center: [number, number];
  place_type: string[];
  relevance?: number;

  properties?: {
    country_code?: string;
    short_code?: string;
    place_designation?: string;
  };

  context?: MapTilerContext[];
};

type MapTilerResponse = {
  features?: MapTilerFeature[];
};

type CountryInfo = {
  countryCode: string | null;
  countryName: string | null;
};

type ScoredFeature = {
  feature: MapTilerFeature;
  score: number;
};

function normalizeText(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function parseSearchQuery(query: string) {
  const parts = query
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    primary: parts[0] ?? query.trim(),
    hints: parts.slice(1),
  };
}

function levenshteinDistance(
  firstValue: string,
  secondValue: string,
) {
  const first = normalizeText(firstValue);
  const second = normalizeText(secondValue);

  if (first === second) {
    return 0;
  }

  if (!first.length) {
    return second.length;
  }

  if (!second.length) {
    return first.length;
  }

  let previous = Array.from(
    { length: second.length + 1 },
    (_, index) => index,
  );

  for (
    let firstIndex = 1;
    firstIndex <= first.length;
    firstIndex += 1
  ) {
    const current = new Array<number>(
      second.length + 1,
    );

    current[0] = firstIndex;

    for (
      let secondIndex = 1;
      secondIndex <= second.length;
      secondIndex += 1
    ) {
      const substitutionCost =
        first[firstIndex - 1] ===
        second[secondIndex - 1]
          ? 0
          : 1;

      current[secondIndex] = Math.min(
        current[secondIndex - 1] + 1,
        previous[secondIndex] + 1,
        previous[secondIndex - 1] +
          substitutionCost,
      );
    }

    previous = current;
  }

  return previous[second.length];
}

function looselyMatches(
  hint: string,
  candidate: string,
) {
  const normalizedHint =
    normalizeText(hint);

  const normalizedCandidate =
    normalizeText(candidate);

  if (
    !normalizedHint ||
    !normalizedCandidate
  ) {
    return false;
  }

  if (
    normalizedHint ===
    normalizedCandidate
  ) {
    return true;
  }

  if (
    normalizedCandidate.includes(
      normalizedHint,
    ) ||
    normalizedHint.includes(
      normalizedCandidate,
    )
  ) {
    return true;
  }

  if (normalizedHint.length < 5) {
    return false;
  }

  if (
    Math.abs(
      normalizedHint.length -
        normalizedCandidate.length,
    ) <= 2 &&
    levenshteinDistance(
      normalizedHint,
      normalizedCandidate,
    ) <= 2
  ) {
    return true;
  }

  return normalizedCandidate
    .split(" ")
    .some((word) => {
      if (
        word.length < 5 ||
        Math.abs(
          word.length -
            normalizedHint.length,
        ) > 2
      ) {
        return false;
      }

      return (
        levenshteinDistance(
          normalizedHint,
          word,
        ) <= 2
      );
    });
}

function getCountry(
  feature: MapTilerFeature,
): CountryInfo {
  if (
    feature.place_type.includes(
      "country",
    )
  ) {
    return {
      countryCode:
        feature.properties
          ?.country_code
          ?.toUpperCase() ??
        null,

      countryName:
        feature.text,
    };
  }

  const countryContext =
    feature.context?.find(
      (item) =>
        item.id?.startsWith(
          "country.",
        ),
    );

  return {
    countryCode:
      (
        countryContext?.country_code ??
        feature.properties
          ?.country_code
      )?.toUpperCase() ??
      null,

    countryName:
      countryContext?.text ??
      null,
  };
}

function getKind(
  feature: MapTilerFeature,
) {
  if (
    feature.place_type.includes(
      "country",
    )
  ) {
    return "country" as const;
  }

  return "city" as const;
}

function getDesignation(
  feature: MapTilerFeature,
) {
  return normalizeText(
    feature.properties
      ?.place_designation ??
      "",
  );
}

function getTypeScore(
  feature: MapTilerFeature,
) {
  const designation =
    getDesignation(feature);

  /*
   * Actual populated-place
   * information wins over the
   * generic index type.
   */
  if (
    designation.includes(
      "national capital",
    )
  ) {
    return 1500;
  }

  if (
    designation.includes(
      "capital",
    )
  ) {
    return 1400;
  }

  if (
    designation === "city" ||
    designation.includes(
      "city",
    )
  ) {
    return 1250;
  }

  if (
    designation.includes(
      "town",
    )
  ) {
    return 800;
  }

  if (
    designation.includes(
      "village",
    )
  ) {
    return 350;
  }

  if (
    designation.includes(
      "hamlet",
    )
  ) {
    return 100;
  }

  /*
   * Important:
   *
   * Global administrative
   * hierarchies are weird.
   *
   * Prague, for example, is
   * represented as a region by
   * MapTiler.
   */
  if (
    feature.place_type.includes(
      "region",
    )
  ) {
    return 900;
  }

  if (
    feature.place_type.includes(
      "place",
    )
  ) {
    return 850;
  }

  if (
    feature.place_type.includes(
      "joint_municipality",
    )
  ) {
    return 800;
  }

  if (
    feature.place_type.includes(
      "municipality",
    )
  ) {
    return 750;
  }

  if (
    feature.place_type.includes(
      "municipal_district",
    )
  ) {
    return 550;
  }

  if (
    feature.place_type.includes(
      "locality",
    )
  ) {
    return 450;
  }

  if (
    feature.place_type.includes(
      "subregion",
    )
  ) {
    return 400;
  }

  if (
    feature.place_type.includes(
      "county",
    )
  ) {
    return 350;
  }

  if (
    feature.place_type.includes(
      "country",
    )
  ) {
    return 250;
  }

  return 100;
}

function getContextNames(
  feature: MapTilerFeature,
  country: CountryInfo,
) {
  const names = [
    ...feature.place_name
      .split(",")
      .slice(1),

    ...(feature.context ?? []).map(
      (item) => item.text ?? "",
    ),

    country.countryName ?? "",
  ]
    .map((value) => value.trim())
    .filter(Boolean);

  return Array.from(
    new Set(names),
  );
}

function getContextCodes(
  feature: MapTilerFeature,
  country: CountryInfo,
) {
  const codes = [
    country.countryCode,
    feature.properties
      ?.country_code,
    feature.properties
      ?.short_code,

    ...(feature.context ?? [])
      .flatMap((item) => [
        item.country_code,
        item.short_code,
      ]),
  ]
    .filter(
      (
        value,
      ): value is string =>
        Boolean(value),
    )
    .flatMap((value) => {
      const normalized =
        normalizeText(value);

      return [
        normalized,
        ...normalized.split(" "),
      ];
    });

  return Array.from(
    new Set(codes),
  );
}

function getHintScore(
  hint: string,
  feature: MapTilerFeature,
) {
  const normalizedHint =
    normalizeText(hint);

  if (!normalizedHint) {
    return 0;
  }

  const country =
    getCountry(feature);

  const codes =
    getContextCodes(
      feature,
      country,
    );

  /*
   * Los Angeles, CA
   *
   * short_code may arrive as:
   * US-CA
   *
   * normalizeText turns that
   * into "us ca", and "ca"
   * becomes one of the tokens.
   */
  if (
    codes.includes(
      normalizedHint,
    )
  ) {
    return 2400;
  }

  const contextNames =
    getContextNames(
      feature,
      country,
    );

  for (
    const contextName of
    contextNames
  ) {
    if (
      normalizeText(
        contextName,
      ) === normalizedHint
    ) {
      return 2200;
    }
  }

  for (
    const contextName of
    contextNames
  ) {
    const normalizedContext =
      normalizeText(
        contextName,
      );

    if (
      normalizedContext.includes(
        normalizedHint,
      ) ||
      normalizedHint.includes(
        normalizedContext,
      )
    ) {
      return 1500;
    }
  }

  /*
   * Handles:
   *
   * California
   * Californai
   */
  for (
    const contextName of
    contextNames
  ) {
    if (
      looselyMatches(
        normalizedHint,
        contextName,
      )
    ) {
      return 1000;
    }
  }

  /*
   * If the user explicitly said
   * Czechia, a Prague in the US
   * should be strongly punished.
   */
  return -900;
}

function scoreFeature(
  feature: MapTilerFeature,
  primary: string,
  hints: string[],
) {
  const normalizedPrimary =
    normalizeText(primary);

  const normalizedText =
    normalizeText(
      feature.text,
    );

  const normalizedMatchingText =
    normalizeText(
      feature.matching_text ??
        "",
    );

  const normalizedPlaceName =
    normalizeText(
      feature.place_name,
    );

  let score =
    getTypeScore(feature);

  /*
   * Keep MapTiler's relevance
   * as a useful tie-breaker,
   * not as the main ranking.
   */
  score +=
    (feature.relevance ?? 0) *
    600;

  /*
   * Exact requested name is
   * the strongest signal.
   */
  if (
    normalizedText ===
      normalizedPrimary ||
    normalizedMatchingText ===
      normalizedPrimary
  ) {
    score += 4000;
  } else if (
    normalizedText.startsWith(
      normalizedPrimary,
    ) ||
    normalizedMatchingText.startsWith(
      normalizedPrimary,
    )
  ) {
    score += 2200;
  } else if (
    normalizedText.includes(
      normalizedPrimary,
    ) ||
    normalizedMatchingText.includes(
      normalizedPrimary,
    )
  ) {
    score += 1300;
  } else if (
    normalizedPlaceName.includes(
      normalizedPrimary,
    )
  ) {
    score += 800;
  }

  /*
   * Multi-word city names.
   */
  const primaryWords =
    normalizedPrimary
      .split(" ")
      .filter(Boolean);

  if (
    primaryWords.length > 1 &&
    primaryWords.every(
      (word) =>
        normalizedText.includes(
          word,
        ) ||
        normalizedMatchingText.includes(
          word,
        ),
    )
  ) {
    score += 700;
  }

  for (const hint of hints) {
    score += getHintScore(
      hint,
      feature,
    );
  }

  /*
   * Searching directly for a
   * country still works.
   */
  if (
    feature.place_type.includes(
      "country",
    ) &&
    normalizedText ===
      normalizedPrimary
  ) {
    score += 2500;
  }

  return score;
}

function isGoodCityCandidate(
  feature: MapTilerFeature,
  primary: string,
) {
  if (
    feature.place_type.includes(
      "country",
    )
  ) {
    return false;
  }

  const designation =
    getDesignation(feature);

  if (
    designation.includes(
      "capital",
    ) ||
    designation.includes(
      "city",
    ) ||
    designation.includes(
      "town",
    )
  ) {
    return true;
  }

  if (
    feature.place_type.includes(
      "place",
    ) ||
    feature.place_type.includes(
      "municipality",
    ) ||
    feature.place_type.includes(
      "joint_municipality",
    ) ||
    feature.place_type.includes(
      "locality",
    )
  ) {
    return true;
  }

  /*
   * Prague case:
   *
   * It is a region in MapTiler,
   * but if the name itself
   * exactly matches what the
   * user typed, keep it among
   * the important results.
   */
  return (
    normalizeText(
      feature.text,
    ) ===
    normalizeText(primary)
  );
}

function dedupeFeatures(
  features: MapTilerFeature[],
) {
  const seen =
    new Set<string>();

  const unique:
    MapTilerFeature[] = [];

  for (const feature of features) {
    const [
      longitude,
      latitude,
    ] = feature.center;

    const country =
      getCountry(feature);

    const key = [
      normalizeText(
        feature.text,
      ),

      country.countryCode ??
        "",

      latitude.toFixed(2),

      longitude.toFixed(2),
    ].join("|");

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    unique.push(feature);
  }

  return unique;
}

function orderResults(
  scored: ScoredFeature[],
  primary: string,
) {
  const sorted = [...scored].sort(
    (first, second) =>
      second.score -
      first.score,
  );

  const result:
    ScoredFeature[] = [];

  const used =
    new Set<string>();

  /*
   * First result should simply
   * be our strongest overall
   * match.
   *
   * This lets:
   *
   * Prague, Czechia
   *
   * beat smaller Pragues even
   * though Prague is technically
   * a "region".
   */
  const strongest =
    sorted[0];

  if (strongest) {
    result.push(strongest);

    used.add(
      strongest.feature.id,
    );
  }

  /*
   * Then prefer up to two more
   * city-ish results.
   *
   * So the top section doesn't
   * become a wall of random
   * administrative areas.
   */
  const cityCandidates =
    sorted
      .filter(
        ({ feature }) =>
          !used.has(
            feature.id,
          ) &&
          isGoodCityCandidate(
            feature,
            primary,
          ),
      )
      .slice(0, 2);

  for (
    const candidate of
    cityCandidates
  ) {
    result.push(candidate);

    used.add(
      candidate.feature.id,
    );
  }

  /*
   * Fill the rest with the next
   * strongest matching places.
   */
  for (const candidate of sorted) {
    if (
      result.length >= 8
    ) {
      break;
    }

    if (
      used.has(
        candidate.feature.id,
      )
    ) {
      continue;
    }

    result.push(candidate);

    used.add(
      candidate.feature.id,
    );
  }

  return result.slice(0, 8);
}

export async function GET(
  request: Request,
) {
  const supabase =
    await createClient();

  const {
    data: { user },
  } =
    await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      {
        error:
          "unauthorized",
      },
      {
        status: 401,
      },
    );
  }

  const requestUrl =
    new URL(request.url);

  const rawQuery =
    requestUrl.searchParams
      .get("q")
      ?.trim();

  if (
    !rawQuery ||
    rawQuery.length < 2
  ) {
    return NextResponse.json({
      results: [],
    });
  }

  const apiKey =
    process.env
      .NEXT_PUBLIC_MAPTILER_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "map configuration is missing",
      },
      {
        status: 500,
      },
    );
  }

  const {
    primary,
    hints,
  } =
    parseSearchQuery(
      rawQuery,
    );

  if (primary.length < 2) {
    return NextResponse.json({
      results: [],
    });
  }

  const url =
    new URL(
      `https://api.maptiler.com/geocoding/${encodeURIComponent(
        primary,
      )}.json`,
    );

  url.searchParams.set(
    "key",
    apiKey,
  );

  url.searchParams.set(
    "language",
    "en",
  );

  url.searchParams.set(
    "limit",
    "10",
  );

  /*
   * Do NOT narrow this too much.
   *
   * MapTiler's hierarchy differs
   * by country.
   *
   * Prague itself is a region.
   */
  url.searchParams.set(
    "types",
    [
      "region",
      "subregion",
      "county",
      "joint_municipality",
      "joint_submunicipality",
      "municipality",
      "municipal_district",
      "locality",
      "place",
      "country",
    ].join(","),
  );

  url.searchParams.set(
    "autocomplete",
    "true",
  );

  url.searchParams.set(
    "fuzzyMatch",
    "true",
  );

  const response =
    await fetch(url, {
      headers: {
        Accept:
          "application/json",

        Origin:
          requestUrl.origin,
      },

      next: {
        revalidate: 3600,
      },
    });

  if (!response.ok) {
    console.error(
      "atlaslog geocoding error:",
      response.status,
      await response.text(),
    );

    return NextResponse.json(
      {
        error:
          "place search failed",
      },
      {
        status: 502,
      },
    );
  }

  const data =
    (await response.json()) as MapTilerResponse;

  const features =
    dedupeFeatures(
      data.features ?? [],
    );

  const scored =
    features.map(
      (feature) => ({
        feature,

        score:
          scoreFeature(
            feature,
            primary,
            hints,
          ),
      }),
    );

  const ordered =
    orderResults(
      scored,
      primary,
    );

  const results =
    ordered.map(
      ({ feature }) => {
        const [
          longitude,
          latitude,
        ] =
          feature.center;

        const country =
          getCountry(feature);

        return {
          id:
            feature.id,

          name:
            feature.text,

          label:
            feature.place_name,

          kind:
            getKind(feature),

          countryCode:
            country.countryCode,

          countryName:
            country.countryName,

          latitude,
          longitude,
        };
      },
    );

  return NextResponse.json(
    {
      results,
    },
    {
      headers: {
        "Content-Type":
          "application/json; charset=utf-8",
      },
    },
  );
}