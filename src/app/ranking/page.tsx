import Link from "next/link";
import { redirect } from "next/navigation";
import LeaderboardTabs from "@/components/challenge/LeaderboardTabs";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import { getCompanyById, getMembership } from "@/lib/challenge/helpers";

export default async function RankingPage() {
  const supabase = getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let membership: Awaited<ReturnType<typeof getMembership>> | null = null;
  try {
    membership = await getMembership(supabase, user.id);
  } catch {
    membership = null;
  }

  if (!membership) {
    return (
      <section className="bg-white px-4 py-16 text-black">
        <div className="mx-auto max-w-2xl space-y-4 rounded-3xl border border-black/10 bg-white p-10 text-center shadow">
          <h1 className="text-3xl font-semibold">Ranking disponible según tu empresa</h1>
          <p className="text-sm text-gray-600">
            Entra desde el enlace privado de tu empresa para activar el tablero y sumar puntos.
          </p>
          <Link
            href="/contacto"
            className="inline-flex items-center justify-center rounded-md bg-black px-6 py-3 font-semibold text-white"
          >
            Solicitar enlace
          </Link>
        </div>
      </section>
    );
  }

  const company = await getCompanyById(supabase, membership.company_id);

  return (
    <section className="bg-white px-4 py-16 text-black">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-gray-500">{company.name}</p>
          <h1 className="text-3xl font-semibold">Ranking</h1>
          <p className="text-sm text-gray-600">
            Compara los puntos diarios, semanales y mensuales. Solo cuenta el día actual, sin backfill.
          </p>
        </header>
        <LeaderboardTabs companyId={company.id} currentUserId={user.id} />
      </div>
    </section>
  );
}
