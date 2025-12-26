import Link from "next/link";
import { notFound } from "next/navigation";
import CompanyJoinActions from "@/components/challenge/CompanyJoinActions";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";

type Params = {
  slug: string;
};

export default async function CompanyPage({ params }: { params: Params }) {
  const supabase = getSupabaseServerClient();
  const slug = params.slug.toLowerCase();

  const { data: company, error } = await supabase
    .from("companies")
    .select("id, name, slug")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !company) {
    notFound();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isMember = false;
  if (user) {
    const { data: membership } = await supabase
      .from("company_members")
      .select("id")
      .eq("user_id", user.id)
      .eq("company_id", company.id)
      .maybeSingle();
    isMember = Boolean(membership);
  }

  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center bg-white px-4 py-16 text-black">
      <div className="w-full max-w-xl space-y-6 rounded-3xl border border-black/10 bg-white p-10 shadow-lg">
        <p className="text-xs uppercase tracking-wide text-gray-500">Reto corporativo</p>
        <h1 className="text-3xl font-semibold">
          {company.name}
        </h1>
        <p className="text-base text-gray-600">
          Completa tus hábitos diarios durante 90 días. Solo necesitas una cuenta y todo se resuelve desde
          el dashboard.
        </p>
        <CompanyJoinActions
          companySlug={company.slug}
          isAuthenticated={Boolean(user)}
          isMember={isMember}
        />
        {!user && (
          <p className="text-sm text-gray-500">
            ¿Dudas?{" "}
            <Link href="/contacto" className="font-semibold underline">
              Hablemos
            </Link>
          </p>
        )}
      </div>
    </section>
  );
}
