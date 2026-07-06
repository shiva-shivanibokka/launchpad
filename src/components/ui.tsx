import type { ReactNode } from 'react'

// Small shared building blocks used across the tracker.

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-white/10 bg-card/60 shadow-card backdrop-blur-md ${className}`}>
      {children}
    </section>
  )
}

export function SectionTitle({ icon, title, right }: { icon: string; title: string; right?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h2 className="flex items-center gap-2.5 font-display text-[25px] font-extrabold uppercase tracking-tight text-ink">
        <span className="text-[26px]">{icon}</span>
        {title}
      </h2>
      {right}
    </div>
  )
}

export function ProgressBar({ value, total, color = '#a78bfa' }: { value: number; total: number; color?: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.08]">
      <div
        className="h-full rounded-full transition-[width] duration-500"
        style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, #34d399)` }}
      />
    </div>
  )
}

export function Pill({ children, color = '#a78bfa' }: { children: ReactNode; color?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border px-3 py-1 font-mono text-[17px] font-bold"
      style={{ color, borderColor: `${color}55`, background: `${color}14` }}
    >
      {children}
    </span>
  )
}

export function Dot({ color }: { color: string }) {
  return <span className="inline-block h-2 w-2 rounded-full" style={{ background: color }} />
}

// A labelled text/select/date field for the forms.
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block font-mono text-[16.5px] uppercase tracking-wide text-muted">{label}</span>
      {children}
    </label>
  )
}

const inputCls =
  'w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 font-sans text-[17.5px] text-ink outline-none transition focus:border-accent-violet/60'

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputCls} ${props.className || ''}`} />
}
export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputCls} min-h-[64px] resize-y ${props.className || ''}`} />
}

export function Button({
  children,
  variant = 'ghost',
  ...rest
}: { children: ReactNode; variant?: 'primary' | 'ghost' | 'danger' } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const styles =
    variant === 'primary'
      ? 'border-accent-violet/50 bg-accent-violet/15 text-accent-violet hover:-translate-y-px'
      : variant === 'danger'
        ? 'border-accent-rose/40 bg-accent-rose/10 text-accent-rose hover:bg-accent-rose/20'
        : 'border-white/12 bg-white/[0.03] text-muted hover:border-white/25 hover:text-ink'
  return (
    <button
      {...rest}
      className={`whitespace-nowrap rounded-lg border px-4 py-2 font-mono text-[17.5px] font-bold transition disabled:opacity-50 ${styles} ${rest.className || ''}`}
    >
      {children}
    </button>
  )
}
