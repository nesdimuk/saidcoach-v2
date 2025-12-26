import Link from "next/link";
import { redirect } from "next/navigation";
import DashboardChecklist from "@/components/challenge/DashboardChecklist";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import {
  getActiveChallengeForToday,
  getCompanyById,
  getMembership,
} from "@/lib/challenge/helpers";
import { getCurrentDateTime } from "@/lib/challenge/time";

export default async function DashboardPage() {
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
          <h1 className="text-3xl font-semibold">Configura tu empresa</h1>
          <p className="text-sm text-gray-600">
            Este dashboard funciona cuando entras mediante el enlace privado de tu empresa. Solicítalo a tu
            administrador para vincular tu cuenta.
          </p>
          <Link
            href="/contacto"
            className="inline-flex items-center justify-center rounded-md bg-black px-6 py-3 font-semibold text-white"
          >
            Pedir acceso
          </Link>
        </div>
      </section>
    );
  }

  const { isoDate: today } = getCurrentDateTime();
  const company = await getCompanyById(supabase, membership.company_id);
  const challenge = await getActiveChallengeForToday(supabase, membership.company_id, today);

  return (
    <section className="bg-white px-4 py-16 text-black">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-gray-500">{company.name}</p>
          <h1 className="text-3xl font-semibold">Checklist diario</h1>
          <p className="text-sm text-gray-600">
            Solo cuenta el día de hoy. Completa al menos 4 hábitos para mantener la racha.
          </p>
        </header>
        <DashboardChecklist companyId={company.id} challenge={challenge} />
      </div>
    </section>
  );
}
