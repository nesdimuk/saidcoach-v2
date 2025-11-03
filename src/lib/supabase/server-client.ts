import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

type CookieStore = Awaited<ReturnType<typeof cookies>>;

export function getSupabaseServerClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase environment variables are missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  return createServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        const store = cookies() as unknown as CookieStore;
        return store.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          const store = cookies() as unknown as CookieStore;
          store.set({ name, value, ...options });
        } catch {
          // noop in read-only contexts (Server Components)
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          const store = cookies() as unknown as CookieStore;
          store.set({ name, value: "", ...options, maxAge: 0 });
        } catch {
          // noop in read-only contexts (Server Components)
        }
      },
    },
  });
}
