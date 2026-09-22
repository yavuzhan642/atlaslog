"use client";

import {
  ArrowUp,
  CarFront,
  LoaderCircle,
  Mountain,
  RotateCcw,
  Sparkles,
  Sun,
  Waves,
} from "lucide-react";

import {
  FormEvent,
  KeyboardEvent,
  useState,
} from "react";

type ChatMessage = {
  role: "user" | "model";
  text: string;
};

const suggestions = [
  {
    label:
      "3 days somewhere warm",
    icon: Sun,
  },

  {
    label:
      "a quiet mountain escape",
    icon: Mountain,
  },

  {
    label:
      "weekend by the sea",
    icon: Waves,
  },

  {
    label:
      "a scenic road trip",
    icon: CarFront,
  },
];

export function AskAtlaslog() {
  const [
    prompt,
    setPrompt,
  ] = useState("");

  const [
    messages,
    setMessages,
  ] =
    useState<
      ChatMessage[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

  async function sendMessage() {
    const cleanPrompt =
      prompt.trim();

    if (
      !cleanPrompt ||
      loading
    ) {
      return;
    }

    const userMessage:
      ChatMessage = {
      role: "user",
      text: cleanPrompt,
    };

    const nextMessages = [
      ...messages,
      userMessage,
    ];

    setMessages(
      nextMessages,
    );

    setPrompt("");

    setError(null);

    setLoading(true);

    try {
      const response =
        await fetch(
          "/api/explore/chat",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              messages:
                nextMessages,
            }),
          },
        );

      const data =
        (await response.json()) as {
          text?: string;
          error?: string;
        };

      if (
        !response.ok ||
        !data.text
      ) {
        throw new Error(
          data.error ??
            "could not get a response",
        );
      }

      setMessages(
        (current) => [
          ...current,

          {
            role:
              "model",

            text:
              data.text!,
          },
        ],
      );
    } catch (requestError) {
      console.error(
        "atlaslog explore chat error:",
        requestError,
      );

      setError(
        "couldn't reach atlaslog right now. try again in a moment.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    void sendMessage();
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement>,
  ) {
    if (
      event.key ===
        "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      void sendMessage();
    }
  }

  function resetChat() {
    if (loading) {
      return;
    }

    setMessages([]);

    setPrompt("");

    setError(null);
  }

  return (
    <section className="relative overflow-hidden rounded-[26px] border border-white/[0.09] bg-[#101318]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.055),transparent_38%)]" />

      <div className="relative p-5 sm:p-7">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white/45">
            <Sparkles
              size={15}
              strokeWidth={1.7}
            />

            <p className="text-xs font-medium">
              ask atlaslog
            </p>
          </div>

          {messages.length >
            0 && (
            <button
              type="button"
              onClick={
                resetChat
              }
              disabled={
                loading
              }
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] text-white/25 transition hover:bg-white/[0.04] hover:text-white/50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <RotateCcw
                size={12}
                strokeWidth={1.8}
              />

              new chat
            </button>
          )}
        </div>

        {messages.length ===
        0 ? (
          <>
            <div className="mt-5 max-w-xl">
              <h2 className="text-2xl font-semibold tracking-[-0.04em] text-white sm:text-[28px]">
                what kind of trip
                are you looking for?
              </h2>

              <p className="mt-2 text-sm leading-6 text-white/35">
                describe the mood,
                time, season or type
                of place you have in
                mind.
              </p>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {suggestions.map(
                ({
                  label,
                  icon: Icon,
                }) => (
                  <button
                    key={
                      label
                    }
                    type="button"
                    onClick={() =>
                      setPrompt(
                        label,
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-full border border-white/[0.075] bg-white/[0.025] px-3 py-2 text-[11px] text-white/40 transition hover:border-white/[0.14] hover:bg-white/[0.05] hover:text-white/65"
                  >
                    <Icon
                      size={
                        13
                      }
                      strokeWidth={
                        1.7
                      }
                    />

                    {
                      label
                    }
                  </button>
                ),
              )}
            </div>
          </>
        ) : (
          <div className="mt-6 max-h-[420px] space-y-5 overflow-y-auto pr-1">
            {messages.map(
              (
                message,
                index,
              ) => (
                <div
                  key={`${message.role}-${index}`}
                  className={
                    message.role ===
                    "user"
                      ? "flex justify-end"
                      : "flex justify-start"
                  }
                >
                  {message.role ===
                  "user" ? (
                    <div className="max-w-[82%] rounded-[18px] rounded-br-[6px] bg-white px-4 py-3 text-sm leading-6 text-[#12151a]">
                      {
                        message.text
                      }
                    </div>
                  ) : (
                    <div className="max-w-[88%]">
                      <div className="mb-2 flex items-center gap-2 text-[10px] text-white/25">
                        <Sparkles
                          size={
                            11
                          }
                          strokeWidth={
                            1.7
                          }
                        />

                        atlaslog
                      </div>

                      <div className="whitespace-pre-wrap text-sm leading-7 text-white/65">
                        {
                          message.text
                        }
                      </div>
                    </div>
                  )}
                </div>
              ),
            )}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-white/30">
                <LoaderCircle
                  size={14}
                  strokeWidth={1.7}
                  className="animate-spin"
                />

                thinking about it...
              </div>
            )}
          </div>
        )}

        {error && (
          <p className="mt-5 text-xs text-red-300/60">
            {error}
          </p>
        )}

        <form
          onSubmit={
            handleSubmit
          }
          className="mt-7 rounded-[20px] border border-white/[0.09] bg-black/20 p-2"
        >
          <textarea
            value={prompt}
            onChange={(
              event,
            ) =>
              setPrompt(
                event.target
                  .value,
              )
            }
            onKeyDown={
              handleKeyDown
            }
            rows={3}
            maxLength={3000}
            placeholder={
              messages.length >
              0
                ? "ask a follow-up..."
                : "3 days somewhere warm by the sea..."
            }
            className="min-h-[88px] w-full resize-none bg-transparent px-3 py-3 text-[15px] leading-6 text-white outline-none placeholder:text-white/20"
          />

          <div className="flex items-center justify-between gap-3 border-t border-white/[0.06] px-2 pt-2">
            <span className="px-1 text-[10px] text-white/20">
              travel ideas only
            </span>

            <button
              type="submit"
              disabled={
                !prompt.trim() ||
                loading
              }
              aria-label="send travel idea"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#111318] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-25"
            >
              {loading ? (
                <LoaderCircle
                  size={17}
                  strokeWidth={2}
                  className="animate-spin"
                />
              ) : (
                <ArrowUp
                  size={17}
                  strokeWidth={2}
                />
              )}
            </button>
          </div>
        </form>

        {messages.length >
          0 && (
          <p className="mt-3 text-[10px] leading-4 text-white/20">
            travel details can
            change — check current
            information before
            booking.
          </p>
        )}
      </div>
    </section>
  );
}