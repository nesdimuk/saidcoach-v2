import { redirect } from "next/navigation";
import ProfileForm from "@/components/challenge/ProfileForm";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";

export default async function ProfilePage() {
  const supabase = getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <section className="bg-white px-4 py-16 text-black">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">Tu cuenta</p>
          <h1 className="text-3xl font-semibold">Perfil</h1>
          <p className="text-sm text-gray-600">
            Usa esta información para personalizar los retos y recomendaciones.
          </p>
        </div>
        <div className="rounded-3xl border border-black/10 bg-white p-8 shadow">
          <ProfileForm userId={user.id} initialProfile={profile ?? null} />
        </div>
      </div>
    </section>
  );
}
