import EccentricPushupCamera from "@/components/pushup/EccentricPushupCamera";

export const metadata = {
  title: "Push-Up Lab",
  description: "Laboratorio privado para registrar repeticiones de push-up excéntricas.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/lab/pushup",
  },
  other: {
    robots: "noindex, nofollow",
  },
};

export default function PushupLabPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center gap-8 px-4 py-16">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Lab privado</p>
          <h1 className="text-3xl font-semibold">Push-Up Tracking (fase 1)</h1>
        </div>
        <EccentricPushupCamera />
      </div>
    </div>
  );
}
