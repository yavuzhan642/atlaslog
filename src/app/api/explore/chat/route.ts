import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

type ChatMessage = {
  role: "user" | "model";
  text: string;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;

  error?: {
    code?: number;
    message?: string;
    status?: string;
  };
};

const SYSTEM_PROMPT = `
You are atlaslog's travel inspiration assistant.

atlaslog has three separate areas:
- map: users create and manage their own real trips
- places: users review places they have already visited
- explore: users discover possible future travel ideas

You are operating ONLY inside explore.

Your purpose is travel inspiration and brainstorming.

You can:
- suggest destinations
- suggest regions, islands, cities and road trips
- help based on trip duration
- help based on season
- help based on weather preference
- help based on interests
- compare destinations
- create simple day-by-day itinerary ideas
- explain why a destination fits
- ask a short follow-up question if the request is too broad

Important rules:
- never create a trip
- never save a trip
- never modify a trip
- never claim something was added to atlaslog
- never tell the user to add something automatically
- explore is inspiration only

Do not invent:
- live flight prices
- live hotel prices
- current weather
- current opening hours
- current visa requirements
- current transportation schedules

If something depends on current information, briefly say it should be checked before booking.

Respond in the same language the user uses.

Prefer specific destination ideas instead of generic advice.

Keep responses natural and relatively concise.

For destination recommendations:
- usually suggest 2 to 4 strong options
- briefly explain why each fits
- mention an approximate suitable trip duration when useful

When the user chooses a destination, you may help them build a sample itinerary.

Avoid excessive headings and excessive formatting.
`;

const MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.5-flash",
] as const;

function wait(
  milliseconds: number,
) {
  return new Promise<void>(
    (resolve) => {
      setTimeout(
        resolve,
        milliseconds,
      );
    },
  );
}

function isRetryableStatus(
  status: number,
) {
  return (
    status === 408 ||
    status === 429 ||
    status >= 500
  );
}

async function callGemini(
  apiKey: string,
  model: string,
  messages: ChatMessage[],
) {
  const response =
    await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          "x-goog-api-key":
            apiKey,
        },

        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text:
                  SYSTEM_PROMPT,
              },
            ],
          },

          contents:
            messages.map(
              (message) => ({
                role:
                  message.role,

                parts: [
                  {
                    text:
                      message.text,
                  },
                ],
              }),
            ),

          generationConfig: {
            maxOutputTokens:
              1000,
          },
        }),

        cache: "no-store",
      },
    );

  const data =
    (await response.json()) as GeminiResponse;

  return {
    response,
    data,
  };
}

export async function POST(
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

  const apiKey =
    process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "GEMINI_API_KEY is missing",
      },
      {
        status: 500,
      },
    );
  }

  let body: {
    messages?: ChatMessage[];
  };

  try {
    body =
      (await request.json()) as {
        messages?: ChatMessage[];
      };
  } catch {
    return NextResponse.json(
      {
        error:
          "invalid request body",
      },
      {
        status: 400,
      },
    );
  }

  const messages =
    (body.messages ?? [])
      .filter(
        (
          message,
        ): message is ChatMessage =>
          (
            message.role ===
              "user" ||
            message.role ===
              "model"
          ) &&
          typeof message.text ===
            "string" &&
          message.text.trim()
            .length > 0,
      )
      .slice(-12)
      .map((message) => ({
        role:
          message.role,

        text:
          message.text
            .trim()
            .slice(
              0,
              3000,
            ),
      }));

  if (
    messages.length === 0
  ) {
    return NextResponse.json(
      {
        error:
          "message is required",
      },
      {
        status: 400,
      },
    );
  }

  const lastMessage =
    messages[
      messages.length - 1
    ];

  if (
    lastMessage.role !==
    "user"
  ) {
    return NextResponse.json(
      {
        error:
          "last message must be from user",
      },
      {
        status: 400,
      },
    );
  }

  let lastError:
    | GeminiResponse["error"]
    | null = null;

  let lastStatus = 502;

  /*
   * Strategy:
   *
   * 1. gemini-3.5-flash-lite
   * 2. retry once if the error is temporary
   * 3. fallback to gemini-3.5-flash
   * 4. retry once if needed
   */
  for (
    const model of MODELS
  ) {
    for (
      let attempt = 0;
      attempt < 2;
      attempt += 1
    ) {
      try {
        const {
          response,
          data,
        } =
          await callGemini(
            apiKey,
            model,
            messages,
          );

        if (response.ok) {
          const text =
            data.candidates?.[0]
              ?.content?.parts
              ?.map(
                (part) =>
                  part.text ??
                  "",
              )
              .join("")
              .trim();

          if (text) {
            console.log(
              `atlaslog explore: ${model}`,
            );

            return NextResponse.json({
              text,
              model,
            });
          }

          console.error(
            "atlaslog gemini empty response:",
            {
              model,
              data,
            },
          );

          /*
           * Empty success response
           * isn't likely to improve
           * with immediate retries.
           *
           * Move to fallback model.
           */
          break;
        }

        lastStatus =
          response.status;

        lastError =
          data.error ?? null;

        console.error(
          "atlaslog gemini api error:",
          {
            model,
            attempt:
              attempt + 1,

            status:
              response.status,

            error:
              data.error,
          },
        );

        /*
         * Invalid request,
         * bad API key etc.
         *
         * Do not retry these.
         */
        if (
          !isRetryableStatus(
            response.status,
          )
        ) {
          return NextResponse.json(
            {
              error:
                data.error
                  ?.message ??
                `gemini request failed (${response.status})`,
            },
            {
              status:
                response.status,
            },
          );
        }

        /*
         * Temporary problem.
         *
         * Retry once on the same
         * model before falling back.
         */
        if (attempt === 0) {
          await wait(
            700 +
              Math.floor(
                Math.random() *
                  400,
              ),
          );

          continue;
        }

        /*
         * Same model failed twice.
         * Continue to fallback.
         */
        break;
      } catch (error) {
        console.error(
          "atlaslog gemini network error:",
          {
            model,
            attempt:
              attempt + 1,
            error,
          },
        );

        lastStatus = 502;

        if (attempt === 0) {
          await wait(
            700 +
              Math.floor(
                Math.random() *
                  400,
              ),
          );

          continue;
        }

        break;
      }
    }
  }

  return NextResponse.json(
    {
      error:
        lastError?.message ??
        "atlaslog travel assistant is temporarily unavailable. please try again.",
    },
    {
      status:
        lastStatus >= 400 &&
        lastStatus < 600
          ? lastStatus
          : 502,
    },
  );
}