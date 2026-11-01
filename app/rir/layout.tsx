import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Encuentra tu peso | SaidCoach",
  description: "Te guío serie a serie hasta el peso justo para tu RIR objetivo.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f0f0f",
};

export default function RirLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-[100dvh] bg-brand-black text-brand-white">{children}</div>;
}
