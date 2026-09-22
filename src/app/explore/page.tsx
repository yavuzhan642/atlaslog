import {
  Compass,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AskAtlaslog } from "@/components/explore/ask-atlaslog";
import { PrimaryNav } from "@/components/primary-nav";
import {
  EXPLORE_DESTINATIONS,
} from "@/lib/explore-destinations";
import { createClient } from "@/lib/supabase/server";

type PexelsPhoto = {
  id: number;
  url: string;
  photographer: string;

  src: {
    large2x?: string;
    large?: string;
    landscape?: string;
    medium?: string;
    original?: string;
  };
};

type PexelsResponse = {
  photos?: PexelsPhoto[];
};

type DiscoverCover = {
  imageUrl: string;
  photoUrl: string;
  photographer: string;
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

async function searchPexels(
  query: string,
): Promise<DiscoverCover | null> {
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
      "atlaslog explore pexels error:",
      error,
    );

    return null;
  }
}

export default async function ExplorePage() {
  const supabase =
    await createClient();

  const {
    data: { user },
  } =
    await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const covers =
    await Promise.all(
      EXPLORE_DESTINATIONS.map(
        (idea) =>
          searchPexels(
            idea.query,
          ),
      ),
    );

  return (
    <main className="min-h-screen bg-[#090b0e] text-white">
      <div className="mx-auto min-h-screen w-full max-w-7xl px-5 pt-5 pb-36 sm:px-8 sm:pt-6 sm:pb-36">
        <section className="mt-3 sm:mt-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/[0.09] bg-white/[0.055] text-white/65">
              <Compass
                size={20}
                strokeWidth={1.7}
              />
            </div>

            <h1 className="text-3xl font-semibold tracking-[-0.045em]">
              explore
            </h1>
          </div>

          <p className="mt-4 max-w-lg text-sm leading-6 text-white/40">
            ideas for wherever
            you might go next.
          </p>

          <div className="mt-10">
            <AskAtlaslog />
          </div>

          <section className="mt-14 border-t border-white/[0.07] pt-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles
                    size={13}
                    strokeWidth={1.7}
                    className="text-white/30"
                  />

                  <p className="text-xs font-medium text-white/35">
                    discover
                  </p>
                </div>

                <p className="mt-2 text-sm text-white/30">
                  ideas worth
                  travelling for.
                </p>
              </div>

              <a
                href="https://www.pexels.com"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-white/20 transition hover:text-white/45"
              >
                photos provided by
                pexels
              </a>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              {EXPLORE_DESTINATIONS.map(
                (
                  idea,
                  index,
                ) => {
                  const cover =
                    covers[
                      index
                    ];

                  return (
                    <Link
                      key={
                        idea.slug
                      }
                      href={`/explore/${idea.slug}`}
                      className="group relative aspect-[16/10] overflow-hidden rounded-[24px] border border-white/[0.09] bg-[#111419]"
                    >
                      <div
                        className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-[1.03]"
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

                      <div className="absolute inset-x-0 top-0 flex items-start justify-between p-5 sm:p-6">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/35 text-lg backdrop-blur-xl">
                          {countryCodeToFlag(
                            idea.countryCode,
                          )}
                        </div>

                        <span className="rounded-full border border-white/10 bg-black/35 px-3 py-1.5 text-[11px] text-white/65 backdrop-blur-xl">
                          {
                            idea.duration
                          }
                        </span>
                      </div>

                      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                        <h2 className="text-2xl font-semibold tracking-[-0.04em] text-white sm:text-3xl">
                          {
                            idea.title
                          }
                        </h2>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {idea.tags.map(
                            (
                              tag,
                            ) => (
                              <span
                                key={
                                  tag
                                }
                                className="rounded-full border border-white/[0.09] bg-black/25 px-2.5 py-1 text-[10px] text-white/45 backdrop-blur-xl"
                              >
                                {
                                  tag
                                }
                              </span>
                            ),
                          )}
                        </div>

                        <div className="mt-5 flex items-end justify-between gap-4">
                          <span className="text-[10px] text-white/25">
                            curated by
                            atlaslog
                          </span>

                          {cover && (
                            <span className="max-w-[45%] truncate text-right text-[9px] text-white/20">
                              photo ·{" "}
                              {
                                cover.photographer
                              }
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                },
              )}
            </div>
          </section>
        </section>
      </div>

      <PrimaryNav />
    </main>
  );
}