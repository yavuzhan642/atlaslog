"use client";

import {
  Check,
  Images,
  LoaderCircle,
  RotateCcw,
  X,
} from "lucide-react";

import {
  useState,
} from "react";

type Cover = {
  imageUrl: string;
  photoUrl: string;
  photographer: string;
};

type Candidate = Cover & {
  id: number;
  place: string;
};

type TripHighlightCardProps = {
  tripId: string;
  title: string;

  flag: string;

  dateLabel:
    | string
    | null;

  placeNames: string[];

  placeCount: number;

  automaticCover:
    | Cover
    | null;

  savedCover:
    | Cover
    | null;
};

export function TripHighlightCard({
  tripId,
  title,
  flag,
  dateLabel,
  placeNames,
  placeCount,
  automaticCover,
  savedCover,
}: TripHighlightCardProps) {
  const [
    cover,
    setCover,
  ] =
    useState<
      Cover | null
    >(
      savedCover ??
        automaticCover,
    );

  const [
    pickerOpen,
    setPickerOpen,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    savingId,
    setSavingId,
  ] =
    useState<
      number | null
    >(null);

  const [
    candidates,
    setCandidates,
  ] =
    useState<
      Candidate[]
    >([]);

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

  async function openPicker() {
    setPickerOpen(
      true,
    );

    setError(null);

    if (
      candidates.length >
      0
    ) {
      return;
    }

    setLoading(true);

    try {
      const response =
        await fetch(
          `/api/trips/${tripId}/cover`,
          {
            cache:
              "no-store",
          },
        );

      if (
        !response.ok
      ) {
        throw new Error();
      }

      const data =
        (await response.json()) as {
          candidates:
            Candidate[];
        };

      setCandidates(
        data.candidates,
      );
    } catch {
      setError(
        "couldn't load cover options.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function chooseCover(
    candidate: Candidate,
  ) {
    setSavingId(
      candidate.id,
    );

    setError(null);

    try {
      const response =
        await fetch(
          `/api/trips/${tripId}/cover`,
          {
            method:
              "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                imageUrl:
                  candidate.imageUrl,

                photoUrl:
                  candidate.photoUrl,

                photographer:
                  candidate.photographer,
              }),
          },
        );

      if (
        !response.ok
      ) {
        throw new Error();
      }

      setCover({
        imageUrl:
          candidate.imageUrl,

        photoUrl:
          candidate.photoUrl,

        photographer:
          candidate.photographer,
      });

      setPickerOpen(
        false,
      );
    } catch {
      setError(
        "couldn't save this cover.",
      );
    } finally {
      setSavingId(
        null,
      );
    }
  }

  async function resetCover() {
    setLoading(true);
    setError(null);

    try {
      const response =
        await fetch(
          `/api/trips/${tripId}/cover`,
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

      setCover(
        automaticCover,
      );

      setPickerOpen(
        false,
      );
    } catch {
      setError(
        "couldn't reset the cover.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <article className="group relative aspect-[16/10] overflow-hidden rounded-[22px] border border-white/[0.09] bg-[#111419]">
      <div
        className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-[1.025]"
        style={
          cover
            ? {
                backgroundImage: `url("${cover.imageUrl}")`,
              }
            : {
                backgroundImage:
                  "radial-gradient(circle at 25% 20%, rgba(255,255,255,0.12), transparent 35%), linear-gradient(135deg, #1b2027 0%, #0e1115 100%)",
              }
        }
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-black/10" />

      <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between p-5">
        <div className="flex min-h-9 min-w-9 items-center justify-center rounded-xl border border-white/15 bg-black/35 px-2 text-lg backdrop-blur-xl">
          {flag}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                void openPicker()
              }
              className="flex h-8 w-[82px] items-center justify-center gap-1.5 rounded-full border border-white/10 bg-black/35 px-1.5 py-1.5 text-[9px] text-white/65 backdrop-blur-xl transition hover:bg-black/55 hover:text-white/80"
            >
              <Images
                size={10}
                strokeWidth={1.7}
              />

              <span className="text-[12px]">
                cover
              </span>
            </button>

            {dateLabel && (
              <span className="flex h-8 shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-white/10 bg-black/35 px-3 text-[11px] text-white/65 backdrop-blur-xl">
                {dateLabel}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 p-5 sm:p-6">
        <h2 className="text-xl font-semibold tracking-[-0.035em] text-white sm:text-2xl">
          {title}
        </h2>

        <p className="mt-2 truncate text-xs text-white/55">
          {placeNames.join(
            " · ",
          )}
        </p>

        <div className="mt-5 flex items-end justify-between gap-4">
          <span className="text-[11px] text-white/30">
            {placeCount}{" "}
            {placeCount === 1
              ? "place"
              : "places"}
          </span>

          {cover && (
            <a
              href={
                cover.photoUrl
              }
              target="_blank"
              rel="noreferrer"
              onClick={(
                event,
              ) =>
                event.stopPropagation()
              }
              className="max-w-[50%] truncate text-right text-[10px] text-white/25 transition hover:text-white/50"
            >
              photo ·{" "}
              {
                cover.photographer
              }
            </a>
          )}
        </div>
      </div>

      {pickerOpen && (
        <div className="absolute inset-0 z-30 overflow-y-auto bg-[#0b0e12]/95 p-4 backdrop-blur-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-white/65">
                choose cover
              </p>

              <p className="mt-1 text-[10px] text-white/25">
                photos from places
                in this trip.
              </p>
            </div>

            <button
              type="button"
              aria-label="close cover picker"
              onClick={() =>
                setPickerOpen(
                  false,
                )
              }
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.035] text-white/35 transition hover:text-white/70"
            >
              <X
                size={14}
              />
            </button>
          </div>

          {loading ? (
            <div className="flex h-[180px] items-center justify-center">
              <LoaderCircle
                size={18}
                className="animate-spin text-white/30"
              />
            </div>
          ) : (
            <>
              {candidates.length >
                0 && (
                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {candidates.map(
                    (
                      candidate,
                    ) => (
                      <button
                        key={
                          candidate.id
                        }
                        type="button"
                        disabled={
                          savingId !==
                          null
                        }
                        onClick={() =>
                          void chooseCover(
                            candidate,
                          )
                        }
                        className="group/photo relative aspect-[4/3] overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.025] transition hover:border-white/[0.18] disabled:opacity-50"
                      >
                        <img
                          src={
                            candidate.imageUrl
                          }
                          alt=""
                          className="h-full w-full object-cover transition duration-500 group-hover/photo:scale-[1.04]"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />

                        <span className="absolute bottom-2 left-2 max-w-[80%] truncate text-[9px] text-white/60">
                          {
                            candidate.place
                          }
                        </span>

                        {savingId ===
                          candidate.id && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/45">
                            <LoaderCircle
                              size={
                                17
                              }
                              className="animate-spin text-white"
                            />
                          </div>
                        )}
                      </button>
                    ),
                  )}
                </div>
              )}

              {error && (
                <p className="mt-4 text-xs text-red-200/55">
                  {error}
                </p>
              )}

              <div className="mt-4 flex justify-between border-t border-white/[0.06] pt-3">
                <button
                  type="button"
                  onClick={() =>
                    void resetCover()
                  }
                  className="inline-flex h-8 items-center gap-2 rounded-lg px-2 text-[10px] text-white/30 transition hover:bg-white/[0.04] hover:text-white/60"
                >
                  <RotateCcw
                    size={11}
                  />

                  automatic
                </button>

                <a
                  href="https://www.pexels.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center text-[9px] text-white/18 hover:text-white/35"
                >
                  photos by pexels
                </a>
              </div>
            </>
          )}
        </div>
      )}
    </article>
  );
}