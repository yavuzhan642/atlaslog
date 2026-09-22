import {
  createServerClient,
} from "@supabase/ssr";

import {
  createClient as createSupabaseClient,
} from "@supabase/supabase-js";

import {
  cookies,
} from "next/headers";

export async function createClient() {
  const cookieStore =
    await cookies();

  return createServerClient(
    process.env
      .NEXT_PUBLIC_SUPABASE_URL!,
    process.env
      .NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },

        setAll(
          cookiesToSet,
          _headers,
        ) {
          try {
            cookiesToSet.forEach(
              ({
                name,
                value,
                options,
              }) => {
                cookieStore.set(
                  name,
                  value,
                  options,
                );
              },
            );
          } catch {
            // Server Components cannot always write cookies.
            // Session refresh will be handled by the proxy later.
          }
        },
      },
    },
  );
}

export function createAdminClient() {
  const supabaseUrl =
    process.env
      .NEXT_PUBLIC_SUPABASE_URL;

  const secretKey =
    process.env
      .SUPABASE_SECRET_KEY ??
    process.env
      .SUPABASE_SERVICE_ROLE_KEY;

  if (
    !supabaseUrl ||
    !secretKey
  ) {
    throw new Error(
      "missing Supabase admin environment variables",
    );
  }

  return createSupabaseClient(
    supabaseUrl,
    secretKey,
    {
      auth: {
        autoRefreshToken:
          false,
        persistSession:
          false,
        detectSessionInUrl:
          false,
      },
    },
  );
}