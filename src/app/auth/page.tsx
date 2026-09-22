"use client";

import {
  FormEvent,
  useState,
} from "react";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

import { AtlaslogLogo } from "@/components/atlaslog-logo";
import { createClient } from "@/lib/supabase/client";

type AuthMode =
  | "sign-in"
  | "sign-up";

export default function AuthPage() {
  const router =
    useRouter();

  const [
    mode,
    setMode,
  ] =
    useState<AuthMode>(
      "sign-in",
    );

  const [
    displayName,
    setDisplayName,
  ] =
    useState("");

  const [
    email,
    setEmail,
  ] =
    useState("");

  const [
    password,
    setPassword,
  ] =
    useState("");

  const [
    message,
    setMessage,
  ] =
    useState<
      string | null
    >(null);

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setLoading(true);
    setMessage(null);

    const supabase =
      createClient();

    if (
      mode ===
      "sign-in"
    ) {
      const {
        error,
      } =
        await supabase.auth.signInWithPassword(
          {
            email,
            password,
          },
        );

      if (error) {
        setMessage(
          error.message,
        );

        setLoading(
          false,
        );

        return;
      }

      router.push("/");
      router.refresh();

      return;
    }

    const {
      data,
      error,
    } =
      await supabase.auth.signUp(
        {
          email,
          password,

          options: {
            data: {
              display_name:
                displayName.trim(),
            },
          },
        },
      );

    if (error) {
      setMessage(
        error.message,
      );

      setLoading(
        false,
      );

      return;
    }

    if (
      data.session
    ) {
      router.push("/");
      router.refresh();

      return;
    }

    setMessage(
      "check your email to confirm your account.",
    );

    setLoading(false);
  }

  function switchMode(
    nextMode: AuthMode,
  ) {
    setMode(
      nextMode,
    );

    setMessage(null);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#090b0e] px-5 py-10 text-white">
      <div className="w-full max-w-[400px]">
        <div className="mb-10 flex items-center gap-3">
          <AtlaslogLogo
            size="md"
            priority
          />

          <div>
            <p className="text-[15px] font-semibold tracking-[-0.02em]">
              atlaslog
            </p>

            <p className="text-[11px] text-white/35">
              personal travel map
            </p>
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-[-0.045em]">
            {mode ===
            "sign-in"
              ? "welcome back."
              : "create your atlas."}
          </h1>

          <p className="mt-2 text-sm leading-6 text-white/40">
            {mode ===
            "sign-in"
              ? "sign in to continue building your travel history."
              : "start mapping the places that have shaped your travels."}
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 rounded-xl border border-white/[0.08] bg-white/[0.035] p-1">
          <button
            type="button"
            onClick={() =>
              switchMode(
                "sign-in",
              )
            }
            className={[
              "rounded-lg px-3 py-2 text-sm transition",

              mode ===
              "sign-in"
                ? "bg-white/[0.09] text-white"
                : "text-white/40 hover:text-white/70",
            ].join(" ")}
          >
            sign in
          </button>

          <button
            type="button"
            onClick={() =>
              switchMode(
                "sign-up",
              )
            }
            className={[
              "rounded-lg px-3 py-2 text-sm transition",

              mode ===
              "sign-up"
                ? "bg-white/[0.09] text-white"
                : "text-white/40 hover:text-white/70",
            ].join(" ")}
          >
            sign up
          </button>
        </div>

        <form
          onSubmit={
            handleSubmit
          }
          className="space-y-4"
        >
          {mode ===
            "sign-up" && (
            <div>
              <label
                htmlFor="display-name"
                className="mb-2 block text-xs text-white/45"
              >
                name
              </label>

              <input
                id="display-name"
                type="text"
                autoComplete="name"
                required
                maxLength={
                  80
                }
                value={
                  displayName
                }
                onChange={(
                  event,
                ) =>
                  setDisplayName(
                    event
                      .target
                      .value,
                  )
                }
                placeholder="your name"
                className="h-12 w-full rounded-xl border border-white/[0.09] bg-white/[0.045] px-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/[0.2] focus:bg-white/[0.06]"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-xs text-white/45"
            >
              email
            </label>

            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={
                email
              }
              onChange={(
                event,
              ) =>
                setEmail(
                  event
                    .target
                    .value,
                )
              }
              placeholder="you@example.com"
              className="h-12 w-full rounded-xl border border-white/[0.09] bg-white/[0.045] px-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/[0.2] focus:bg-white/[0.06]"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-xs text-white/45"
            >
              password
            </label>

            <input
              id="password"
              type="password"
              autoComplete={
                mode ===
                "sign-in"
                  ? "current-password"
                  : "new-password"
              }
              required
              minLength={
                6
              }
              value={
                password
              }
              onChange={(
                event,
              ) =>
                setPassword(
                  event
                    .target
                    .value,
                )
              }
              placeholder="••••••••"
              className="h-12 w-full rounded-xl border border-white/[0.09] bg-white/[0.045] px-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/[0.2] focus:bg-white/[0.06]"
            />
          </div>

          {message && (
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.035] px-4 py-3 text-xs leading-5 text-white/55">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={
              loading
            }
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#e9ecef] text-sm font-medium text-[#111318] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span>
              {loading
                ? "working..."
                : mode ===
                    "sign-in"
                  ? "sign in"
                  : "create account"}
            </span>

            {!loading && (
              <ArrowRight
                size={
                  16
                }
                strokeWidth={
                  1.9
                }
              />
            )}
          </button>
        </form>
      </div>
    </main>
  );
}