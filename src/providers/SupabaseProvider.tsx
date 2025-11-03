"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const SupabaseContext = createContext<SupabaseClient | null>(null);
const AuthContext = createContext<AuthContextValue | null>(null);

async function syncAuthToServer(event: string, session: unknown) {
  try {
    await fetch("/auth/callback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ event, session }),
    });
  } catch (error) {
    console.warn("No se pudo sincronizar la sesión con el servidor.", error);
  }
}

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const [supabase] = useState(() => getSupabaseBrowserClient());
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    supabase.auth
      .getUser()
      .then(({ data, error }) => {
        if (!isMounted) return;
        if (error) {
          console.warn("No se pudo obtener el usuario actual:", error.message);
        }
        setUser(data?.user ?? null);
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      syncAuthToServer(event, session);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, [supabase]);

  const authValue = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      signOut,
    }),
    [user, loading, signOut]
  );

  const supabaseValue = useMemo(() => supabase, [supabase]);

  return (
    <SupabaseContext.Provider value={supabaseValue}>
      <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
    </SupabaseContext.Provider>
  );
}

export function useSupabaseClient() {
  const client = useContext(SupabaseContext);
  if (!client) {
    throw new Error("useSupabaseClient must be used dentro de SupabaseProvider");
  }
  return client;
}

export function useSupabaseAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useSupabaseAuth debe usarse dentro de SupabaseProvider");
  }
  return context;
}
