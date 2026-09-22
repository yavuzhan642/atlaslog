import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import {
  notFound,
  redirect,
} from "next/navigation";

import { PrimaryNav } from "@/components/primary-nav";
import {
  getExploreDestination,
} from "@/lib/explore-destinations";
import { createClient } from "@/lib/supabase/server";

type PexelsPhoto = {
  id: number;
  url: string;
  photographer: string;

  src: {
    original?: string;
    large2x?: string;
    large?: string;
    landscape?: string;
    medium?: string;
  };
};

type PexelsResponse = {
  photos?: PexelsPhoto[];
};

type Cover = {
  imageUrl: string;
  photoUrl: string;
  photographer: string;
};

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function countryCodeToFlag(
  countryCode: string,
) {
  if (
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

async function getCover(
  query: string,
): Promise<Cover | null> {
  const apiKey =
    process.env
      .PEXELS_API_KEY;

  if (!apiKey) {
    return null;
  }

  const params =
    new URLSearchParams({
      query,
      orientation:
        "landscape",
      size: "large",
      per_page: "1",
    });

  try {
    const response =
      await fetch(
        `https://api.pexels.com/v1/search?${params.toString()}`,
        {
          headers: {
            Authorization:
              apiKey,
          },

          next: {
            revalidate:
              60 *
              60 *
              24 *
              7,
          },
        },
      );

    if (!response.ok) {
      return null;
    }

    const data =
      (await response.json()) as PexelsResponse;

    const photo =
      data.photos?.[0];

    if (!photo) {
      return null;
    }

    const imageUrl =
      photo.src.large2x ??
      photo.src.large ??
      photo.src.landscape ??
      photo.src.medium ??
      photo.src.original;

    if (!imageUrl) {
      return null;
    }

    return {
      imageUrl,
      photoUrl:
        photo.url,
      photographer:
        photo.photographer,
    };
  } catch (error) {
    console.error(
      "atlaslog detail pexels error:",
      error,
    );

    return null;
  }
}

export default async function ExploreDetailPage({
  params,
}: PageProps) {
  const supabase =
    await createClient();

  const {
    data: { user },
  } =
    await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const { slug } =
    await params;

  const destination =
    getExploreDestination(
      slug,
    );

  if (!destination) {
    notFound();
  }

  const cover =
    await getCover(
      destination.query,
    );

  const countryCodes =
    destination.countryCodes ??
    [destination.countryCode];

  return (
    <main className="min-h-screen bg-[#090b0e] text-white">
      <div className="mx-auto min-h-screen w-full max-w-7xl px-5 pt-5 pb-36 sm:px-8 sm:pt-6 sm:pb-36">
        <header>
          <Link
            href="/explore"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 text-sm text-white/45 transition hover:border-white/[0.14] hover:bg-white/[0.06] hover:text-white/75"
          >
            <ArrowLeft
              size={15}
              strokeWidth={1.8}
            />

            <span>
              explore
            </span>
          </Link>
        </header>

        <section className="mt-5">
          <div className="relative aspect-[16/9] overflow-hidden rounded-[28px] border border-white/[0.09] bg-[#111419]">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={
                cover
                  ? {
                      backgroundImage: `url("${cover.imageUrl}")`,
                    }
                  : {
                      backgroundImage:
                        "radial-gradient(circle at 25% 20%, rgba(255,255,255,0.12), transparent 34%), linear-gradient(135deg, #1b2027 0%, #0e1115 100%)",
                    }
              }
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/10" />

            <div className="absolute left-5 top-5 flex min-h-10 min-w-10 items-center justify-center gap-1 rounded-xl border border-white/10 bg-black/35 px-2 text-lg backdrop-blur-xl sm:left-7 sm:top-7">
              {countryCodes.map(
                (countryCode) => (
                  <span
                    key={
                      countryCode
                    }
                  >
                    {countryCodeToFlag(
                      countryCode,
                    )}
                  </span>
                ),
              )}
            </div>

            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 lg:p-10">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-[10px] text-white/60 backdrop-blur-xl">
                  {
                    destination.duration
                  }
                </span>

                {destination.tags.map(
                  (tag) => (
                    <span
                      key={
                        tag
                      }
                      className="rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-[10px] text-white/55 backdrop-blur-xl"
                    >
                      {tag}
                    </span>
                  ),
                )}
              </div>

              <h1 className="mt-4 text-4xl font-semibold tracking-[-0.055em] text-white sm:text-5xl lg:text-6xl">
                {
                  destination.title
                }
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-white/55 sm:text-base">
                {
                  destination.subtitle
                }
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-[24px] border border-white/[0.08] bg-white/[0.025] p-6 sm:p-8">
            <div className="flex items-center gap-2">
              <Sparkles
                size={14}
                strokeWidth={1.7}
                className="text-white/30"
              />

              <p className="text-xs font-medium text-white/35">
                the trip
              </p>
            </div>

            <p className="mt-5 max-w-5xl text-sm leading-7 text-white/45 sm:text-[15px] sm:leading-8">
              {
                destination.trip
              }
            </p>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.75fr)]">
            <section className="rounded-[24px] border border-white/[0.08] bg-white/[0.025] p-6 sm:p-8">
              <div className="flex items-center gap-2">
                <MapPin
                  size={14}
                  strokeWidth={1.7}
                  className="text-white/30"
                />

                <p className="text-xs font-medium text-white/35">
                  a good way through
                </p>
              </div>

              <p className="mt-4 max-w-3xl text-xs leading-6 text-white/30 sm:text-sm sm:leading-7">
                {
                  destination.routeIntro
                }
              </p>

              <div className="mt-7">
                {destination.route.map(
                  (
                    stop,
                    index,
                  ) => (
                    <div
                      key={`${stop.name}-${index}`}
                      className="relative flex gap-4 pb-7 last:pb-0"
                    >
                      {index <
                        destination
                          .route
                          .length -
                          1 && (
                        <div className="absolute left-[18px] top-9 h-[calc(100%-20px)] w-px bg-white/[0.07]" />
                      )}

                      <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.09] bg-[#12151a] text-[10px] tabular-nums text-white/35">
                        {index +
                          1}
                      </div>

                      <div className="min-w-0 pt-1">
                        <h2 className="text-sm font-medium text-white/80 sm:text-base">
                          {
                            stop.name
                          }
                        </h2>

                        <p className="mt-1.5 max-w-2xl text-xs leading-6 text-white/30 sm:text-sm">
                          {
                            stop.description
                          }
                        </p>

                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {stop.highlights.map(
                            (
                              highlight,
                            ) => (
                              <span
                                key={
                                  highlight
                                }
                                className="rounded-full border border-white/[0.07] bg-white/[0.025] px-2.5 py-1 text-[9px] text-white/32 sm:text-[10px]"
                              >
                                {
                                  highlight
                                }
                              </span>
                            ),
                          )}
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </section>

            <aside className="space-y-4">
              <section className="rounded-[24px] border border-white/[0.08] bg-white/[0.025] p-6">
                <div className="flex items-center gap-2">
                  <CalendarDays
                    size={14}
                    strokeWidth={1.7}
                    className="text-white/30"
                  />

                  <p className="text-xs font-medium text-white/35">
                    best time
                  </p>
                </div>

                <p className="mt-5 text-sm text-white/65">
                  {
                    destination.bestTime
                  }
                </p>
              </section>

              <section className="rounded-[24px] border border-white/[0.08] bg-white/[0.025] p-6">
                <div className="flex items-center gap-2">
                  <Sparkles
                    size={14}
                    strokeWidth={1.7}
                    className="text-white/30"
                  />

                  <p className="text-xs font-medium text-white/35">
                    good for
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {destination.goodFor.map(
                    (
                      item,
                    ) => (
                      <span
                        key={
                          item
                        }
                        className="rounded-full border border-white/[0.08] bg-white/[0.025] px-3 py-2 text-[10px] text-white/40"
                      >
                        {
                          item
                        }
                      </span>
                    ),
                  )}
                </div>
              </section>

              <section className="rounded-[24px] border border-white/[0.08] bg-white/[0.025] p-6">
                <p className="text-xs font-medium text-white/35">
                  atlaslog note
                </p>

                <p className="mt-5 text-xs leading-6 text-white/28 sm:text-sm sm:leading-7">
                  {
                    destination.note
                  }
                </p>
              </section>
            </aside>
          </div>

          {cover && (
            <div className="mt-5 flex justify-end">
              <a
                href={
                  cover.photoUrl
                }
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-white/20 transition hover:text-white/45"
              >
                photo ·{" "}
                {
                  cover.photographer
                }{" "}
                · pexels
              </a>
            </div>
          )}
        </section>
      </div>

      <PrimaryNav />
    </main>
  );
}