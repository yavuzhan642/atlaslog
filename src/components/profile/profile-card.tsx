"use client";

import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useState,
} from "react";

type ProfileStats = {
  trips: number;
  countries: number;
  places: number;
};

type ProfileCardProps = {
  displayName: string;
  avatarUrl: string | null;
  stats: ProfileStats;

  updateProfile: (
    formData: FormData,
  ) => Promise<void>;
};

type AvatarPreset = {
  id: string;
  label: string;

  background: string;
  skin: string;
  hair: string;
  shirt: string;

  hairStyle:
    | "long"
    | "bob"
    | "curly-long"
    | "bun"
    | "wave"
    | "short"
    | "curly-short"
    | "fade"
    | "side"
    | "buzz";

  glasses?: boolean;
  beard?: boolean;
};

const AVATARS: AvatarPreset[] = [
  // women

  {
    id: "avatar:01",
    label: "avatar 1",
    background: "#202126",
    skin: "#edc5a3",
    hair: "#2b211e",
    shirt: "#6d647b",
    hairStyle: "long",
  },

  {
    id: "avatar:02",
    label: "avatar 2",
    background: "#1d2423",
    skin: "#a96d4b",
    hair: "#171719",
    shirt: "#4e716a",
    hairStyle: "curly-long",
  },

  {
    id: "avatar:03",
    label: "avatar 3",
    background: "#25211f",
    skin: "#e0ad86",
    hair: "#704c39",
    shirt: "#81685f",
    hairStyle: "bob",
  },

  {
    id: "avatar:04",
    label: "avatar 4",
    background: "#202328",
    skin: "#6f432f",
    hair: "#151617",
    shirt: "#596b7e",
    hairStyle: "bun",
    glasses: true,
  },

  {
    id: "avatar:05",
    label: "avatar 5",
    background: "#22221f",
    skin: "#f0ceb2",
    hair: "#9a755d",
    shirt: "#68745c",
    hairStyle: "wave",
  },

  // men

  {
    id: "avatar:06",
    label: "avatar 6",
    background: "#1d2228",
    skin: "#d8a982",
    hair: "#25211f",
    shirt: "#52697a",
    hairStyle: "short",
  },

  {
    id: "avatar:07",
    label: "avatar 7",
    background: "#202024",
    skin: "#8c593d",
    hair: "#141516",
    shirt: "#656b7c",
    hairStyle: "fade",
    beard: true,
  },

  {
    id: "avatar:08",
    label: "avatar 8",
    background: "#22211e",
    skin: "#edc49f",
    hair: "#6f503c",
    shirt: "#6c725d",
    hairStyle: "curly-short",
  },

  {
    id: "avatar:09",
    label: "avatar 9",
    background: "#222126",
    skin: "#c78966",
    hair: "#2a1e19",
    shirt: "#756378",
    hairStyle: "side",
    glasses: true,
  },

  {
    id: "avatar:10",
    label: "avatar 10",
    background: "#202321",
    skin: "#b77854",
    hair: "#211c1a",
    shirt: "#617066",
    hairStyle: "buzz",
    beard: true,
  },
];

function getAvatar(
  avatarUrl: string | null,
) {
  return (
    AVATARS.find(
      (avatar) =>
        avatar.id === avatarUrl,
    ) ?? AVATARS[0]
  );
}

function AvatarPortrait({
  preset,
  className = "",
}: {
  preset: AvatarPreset;
  className?: string;
}) {
  const isLongHair =
    preset.hairStyle ===
      "long" ||
    preset.hairStyle ===
      "curly-long" ||
    preset.hairStyle ===
      "bob" ||
    preset.hairStyle ===
      "wave";

  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden="true"
      className={className}
    >
      <rect
        width="100"
        height="100"
        rx="27"
        fill={
          preset.background
        }
      />

      {isLongHair && (
        <path
          d="M24 47C24 25 34 14 50 14C67 14 77 26 77 50V79H23V52C23 50 23 49 24 47Z"
          fill={
            preset.hair
          }
        />
      )}

      <path
        d="M21 100C24 78 35 68 50 68C65 68 76 78 79 100Z"
        fill={
          preset.shirt
        }
      />

      <rect
        x="43"
        y="62"
        width="14"
        height="15"
        rx="6"
        fill={
          preset.skin
        }
      />

      <ellipse
        cx="50"
        cy="45"
        rx="21"
        ry="25"
        fill={
          preset.skin
        }
      />

      {preset.hairStyle ===
        "long" && (
        <>
          <path
            d="M28 42C28 24 37 15 51 15C65 15 73 24 73 40C62 35 54 29 41 29C37 35 33 39 28 42Z"
            fill={
              preset.hair
            }
          />

          <path
            d="M27 42C24 54 25 68 28 76H34V44Z"
            fill={
              preset.hair
            }
          />

          <path
            d="M73 42C76 54 75 68 72 76H66V44Z"
            fill={
              preset.hair
            }
          />
        </>
      )}

      {preset.hairStyle ===
        "bob" && (
        <path
          d="M27 43C27 24 37 15 50 15C64 15 73 24 73 44V60C68 57 65 52 64 45C55 39 44 34 36 31C35 42 32 51 27 57Z"
          fill={
            preset.hair
          }
        />
      )}

      {preset.hairStyle ===
        "curly-long" && (
        <>
          <circle
            cx="31"
            cy="31"
            r="10"
            fill={
              preset.hair
            }
          />

          <circle
            cx="42"
            cy="22"
            r="11"
            fill={
              preset.hair
            }
          />

          <circle
            cx="55"
            cy="21"
            r="11"
            fill={
              preset.hair
            }
          />

          <circle
            cx="67"
            cy="29"
            r="10"
            fill={
              preset.hair
            }
          />

          <circle
            cx="28"
            cy="45"
            r="9"
            fill={
              preset.hair
            }
          />

          <circle
            cx="72"
            cy="45"
            r="9"
            fill={
              preset.hair
            }
          />

          <circle
            cx="27"
            cy="60"
            r="8"
            fill={
              preset.hair
            }
          />

          <circle
            cx="73"
            cy="60"
            r="8"
            fill={
              preset.hair
            }
          />
        </>
      )}

      {preset.hairStyle ===
        "bun" && (
        <>
          <circle
            cx="50"
            cy="14"
            r="10"
            fill={
              preset.hair
            }
          />

          <path
            d="M28 40C29 23 38 17 50 17C63 17 71 25 72 40C61 34 53 29 42 30C38 35 33 39 28 40Z"
            fill={
              preset.hair
            }
          />
        </>
      )}

      {preset.hairStyle ===
        "wave" && (
        <>
          <path
            d="M27 42C28 24 37 15 51 15C65 15 73 25 73 42C61 38 56 30 44 29C38 35 33 40 27 42Z"
            fill={
              preset.hair
            }
          />

          <path
            d="M27 42C24 53 25 67 29 75H34V45C31 44 29 43 27 42Z"
            fill={
              preset.hair
            }
          />

          <path
            d="M73 42C76 51 75 65 71 75H66V44C69 44 71 43 73 42Z"
            fill={
              preset.hair
            }
          />
        </>
      )}

      {preset.hairStyle ===
        "short" && (
        <path
          d="M28 40C29 23 38 16 52 16C65 16 72 23 73 37C64 32 57 29 44 30C39 35 34 38 28 40Z"
          fill={
            preset.hair
          }
        />
      )}

      {preset.hairStyle ===
        "curly-short" && (
        <>
          <circle
            cx="34"
            cy="28"
            r="9"
            fill={
              preset.hair
            }
          />

          <circle
            cx="45"
            cy="23"
            r="10"
            fill={
              preset.hair
            }
          />

          <circle
            cx="57"
            cy="23"
            r="10"
            fill={
              preset.hair
            }
          />

          <circle
            cx="67"
            cy="30"
            r="8"
            fill={
              preset.hair
            }
          />
        </>
      )}

      {preset.hairStyle ===
        "fade" && (
        <path
          d="M30 34C33 22 40 17 51 17C62 17 68 23 71 34C59 30 42 30 30 34Z"
          fill={
            preset.hair
          }
        />
      )}

      {preset.hairStyle ===
        "side" && (
        <path
          d="M28 40C29 24 38 16 51 16C64 16 71 23 72 37C60 35 51 29 43 23C39 31 34 37 28 40Z"
          fill={
            preset.hair
          }
        />
      )}

      {preset.hairStyle ===
        "buzz" && (
        <path
          d="M30 32C34 22 41 18 50 18C60 18 67 23 70 33C58 29 42 29 30 32Z"
          fill={
            preset.hair
          }
        />
      )}

      <circle
        cx="42"
        cy="46"
        r="1.8"
        fill="#17191c"
        opacity="0.72"
      />

      <circle
        cx="58"
        cy="46"
        r="1.8"
        fill="#17191c"
        opacity="0.72"
      />

      <path
        d="M45 58C48 60 52 60 55 58"
        fill="none"
        stroke="#553d35"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.55"
      />

      {preset.beard && (
        <path
          d="M33 56C37 68 43 72 50 72C58 72 64 67 67 56C62 63 57 66 50 66C43 66 38 63 33 56Z"
          fill={
            preset.hair
          }
          opacity="0.72"
        />
      )}

      {preset.glasses && (
        <>
          <rect
            x="34"
            y="40"
            width="14"
            height="11"
            rx="5"
            fill="none"
            stroke="#202328"
            strokeWidth="2"
          />

          <rect
            x="52"
            y="40"
            width="14"
            height="11"
            rx="5"
            fill="none"
            stroke="#202328"
            strokeWidth="2"
          />

          <path
            d="M48 44H52"
            stroke="#202328"
            strokeWidth="2"
          />
        </>
      )}
    </svg>
  );
}

export function ProfileCard({
  displayName,
  avatarUrl,
  stats,
  updateProfile,
}: ProfileCardProps) {
  const router =
    useRouter();

  const initialAvatar =
    getAvatar(
      avatarUrl,
    );

  const [
    editing,
    setEditing,
  ] = useState(false);

  const [
    draftName,
    setDraftName,
  ] = useState(
    displayName,
  );

  const [
    draftAvatar,
    setDraftAvatar,
  ] = useState(
    initialAvatar.id,
  );

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  useEffect(() => {
    setDraftName(
      displayName,
    );

    setDraftAvatar(
      getAvatar(
        avatarUrl,
      ).id,
    );
  }, [
    displayName,
    avatarUrl,
  ]);

  const selectedAvatar =
    getAvatar(
      draftAvatar,
    );

  async function handleSave(
    formData: FormData,
  ) {
    setSaving(true);
    setError(null);

    try {
      await updateProfile(
        formData,
      );

      setEditing(false);

      router.refresh();
    } catch (saveError) {
      console.error(
        "atlaslog profile save error:",
        saveError,
      );

      setError(
        "couldn't save your profile.",
      );
    } finally {
      setSaving(false);
    }
  }

  function cancelEditing() {
    setDraftName(
      displayName,
    );

    setDraftAvatar(
      initialAvatar.id,
    );

    setError(null);
    setEditing(false);
  }

  if (!editing) {
    return (
      <section className="overflow-hidden rounded-[26px] border border-white/[0.08] bg-[#101318]">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <div className="h-[88px] w-[88px] shrink-0 overflow-hidden rounded-[28px] border border-white/[0.1] bg-white/[0.03]">
                <AvatarPortrait
                  preset={
                    initialAvatar
                  }
                  className="h-full w-full"
                />
              </div>

              <div>
                <p className="text-[11px] font-medium text-white/25">
                  traveller
                </p>

                <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-white">
                  {displayName}
                </h2>

                <p className="mt-2 text-xs text-white/30">
                  your atlas, one
                  place at a time.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setEditing(
                  true,
                )
              }
              className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-xl border border-white/[0.09] bg-white/[0.035] px-4 text-xs text-white/50 transition hover:border-white/[0.15] hover:bg-white/[0.065] hover:text-white/80 sm:self-center"
            >
              <Pencil
                size={13}
                strokeWidth={1.7}
              />

              edit profile
            </button>
          </div>

          <div className="mt-7 grid grid-cols-3 overflow-hidden rounded-[18px] border border-white/[0.07] bg-black/15">
            <div className="px-4 py-4">
              <p className="text-xl font-semibold tracking-[-0.04em] text-white/85">
                {stats.trips}
              </p>

              <p className="mt-1 text-[10px] text-white/25">
                trips
              </p>
            </div>

            <div className="border-x border-white/[0.06] px-4 py-4">
              <p className="text-xl font-semibold tracking-[-0.04em] text-white/85">
                {
                  stats.countries
                }
              </p>

              <p className="mt-1 text-[10px] text-white/25">
                countries
              </p>
            </div>

            <div className="px-4 py-4">
              <p className="text-xl font-semibold tracking-[-0.04em] text-white/85">
                {stats.places}
              </p>

              <p className="mt-1 text-[10px] text-white/25">
                places
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-[26px] border border-white/[0.1] bg-[#101318]">
      <form
        action={
          handleSave
        }
        className="p-6 sm:p-8"
      >
        <input
          type="hidden"
          name="avatar_url"
          value={
            draftAvatar
          }
        />

        <div>
          <p className="text-xs font-medium text-white/40">
            choose your avatar
          </p>

          <div className="mt-4 grid grid-cols-5 gap-3">
            {AVATARS.map(
              (avatar) => {
                const selected =
                  avatar.id ===
                  selectedAvatar.id;

                return (
                  <button
                    key={
                      avatar.id
                    }
                    type="button"
                    aria-label={
                      avatar.label
                    }
                    aria-pressed={
                      selected
                    }
                    onClick={() =>
                      setDraftAvatar(
                        avatar.id,
                      )
                    }
                    className={`overflow-hidden rounded-[20px] border transition ${
                      selected
                        ? "border-white/35 bg-white/[0.08] ring-2 ring-white/[0.08]"
                        : "border-white/[0.07] bg-white/[0.02] opacity-65 hover:border-white/[0.16] hover:opacity-100"
                    }`}
                  >
                    <AvatarPortrait
                      preset={
                        avatar
                      }
                      className="aspect-square h-full w-full"
                    />
                  </button>
                );
              },
            )}
          </div>
        </div>

        <div className="mt-8">
          <label
            htmlFor="display_name"
            className="mb-2 block text-xs font-medium text-white/40"
          >
            name
          </label>

          <input
            id="display_name"
            name="display_name"
            type="text"
            required
            maxLength={80}
            autoComplete="name"
            value={
              draftName
            }
            onChange={(
              event,
            ) =>
              setDraftName(
                event.target
                  .value,
              )
            }
            placeholder="your name"
            className="h-12 w-full rounded-xl border border-white/[0.09] bg-white/[0.045] px-4 text-sm text-white outline-none transition placeholder:text-white/20 hover:border-white/[0.13] focus:border-white/[0.22] focus:bg-white/[0.06]"
          />
        </div>

        {error && (
          <p className="mt-4 text-xs text-red-300/60">
            {error}
          </p>
        )}

        <div className="mt-7 flex items-center justify-end gap-2 border-t border-white/[0.06] pt-5">
          <button
            type="button"
            onClick={
              cancelEditing
            }
            disabled={
              saving
            }
            className="h-10 rounded-xl px-4 text-xs text-white/35 transition hover:bg-white/[0.04] hover:text-white/65 disabled:opacity-40"
          >
            cancel
          </button>

          <button
            type="submit"
            disabled={
              saving ||
              !draftName.trim()
            }
            className="h-10 rounded-xl bg-[#e9ecef] px-5 text-xs font-medium text-[#111318] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving
              ? "saving..."
              : "save"}
          </button>
        </div>
      </form>
    </section>
  );
}