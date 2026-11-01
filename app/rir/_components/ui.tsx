import type { DecisionColor } from "@/lib/rir/engine";

export const DECISION_STYLE: Record<DecisionColor, { emoji: string; label: string; box: string }> = {
  bajar: { emoji: "🔴", label: "Bajar", box: "bg-red-600 text-white" },
  mantener: { emoji: "🟢", label: "Mantener", box: "bg-green-600 text-white" },
  subir: { emoji: "🟡", label: "Subir", box: "bg-yellow-400 text-black" },
  subir2: { emoji: "🔵", label: "Subir mucho", box: "bg-blue-600 text-white" },
  tecnica: { emoji: "🟣", label: "Técnica", box: "bg-purple-600 text-white" },
  detener: { emoji: "⛔", label: "Detener", box: "bg-neutral-200 text-black" },
};

export const fmtKg = (kg: number) => `${String(kg).replace(".", ",")} kg`;

export function Big({
  children,
  onClick,
  variant = "secondary",
  selected,
  disabled,
  className = "",
  "aria-label": ariaLabel,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  selected?: boolean;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}) {
  const base =
    "min-h-14 w-full rounded-xl px-4 text-lg font-semibold transition active:scale-[0.98] disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange";
  const look =
    variant === "primary"
      ? "bg-brand-orange text-black"
      : variant === "ghost"
        ? "text-brand-white/80 underline"
        : selected
          ? "bg-brand-orange text-black ring-2 ring-white"
          : "bg-white/10 text-brand-white border border-white/20";
  return (
    <button type="button" aria-label={ariaLabel} onClick={onClick} disabled={disabled} className={`${base} ${look} ${className}`}>
      {children}
    </button>
  );
}

export function Screen({ children, footer }: { children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col px-4 pb-6 pt-5">
      <div className="flex-1 space-y-5">{children}</div>
      {footer && <div className="mt-6 space-y-3 pb-[env(safe-area-inset-bottom)]">{footer}</div>}
    </div>
  );
}
