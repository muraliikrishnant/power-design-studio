export function Card({ title, children, className = "" }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border border-slate-800 bg-slate-900 p-4 ${className}`}>
      {title && <h2 className="text-sm font-medium text-slate-400 mb-2">{title}</h2>}
      {children}
    </div>
  );
}

export function Stat({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "good" | "bad" }) {
  const toneClass = tone === "good" ? "text-emerald-400" : tone === "bad" ? "text-rose-400" : "text-slate-100";
  return (
    <div>
      <div className="text-xs text-slate-500">{label}</div>
      <div className={`text-2xl font-semibold ${toneClass}`}>{value}</div>
    </div>
  );
}

export function Badge({ tone, children }: { tone: "good" | "bad" | "neutral"; children: React.ReactNode }) {
  const cls =
    tone === "good" ? "bg-emerald-900 text-emerald-200" : tone === "bad" ? "bg-rose-900 text-rose-200" : "bg-slate-700 text-slate-200";
  return <span className={`px-2 py-0.5 rounded text-xs ${cls}`}>{children}</span>;
}

export function Button({
  children,
  onClick,
  disabled,
  variant = "primary",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
}) {
  const base = "px-3 py-1.5 rounded text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed";
  const variants: Record<string, string> = {
    primary: "bg-sky-600 hover:bg-sky-500 text-white",
    secondary: "bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700",
    danger: "bg-rose-700 hover:bg-rose-600 text-white",
  };
  return (
    <button className={`${base} ${variants[variant]}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-slate-400 text-xs">{label}</span>
      {children}
    </label>
  );
}

export const inputClass = "bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-sm";
