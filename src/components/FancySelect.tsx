import { createPortal } from 'react-dom'
import { usePopover } from './usePopover'

export interface FancyOption {
  value: string
  label: string
  /** Optional hex for a leading status dot (e.g. pipeline stage colors). */
  color?: string
}

// Custom dropdown replacing the native <select>. The option panel renders in a
// portal with fixed positioning so it floats above the glass cards / modal
// instead of being clipped by their backdrop-blur stacking contexts. Fully dark,
// with colored dots and a check on the current value. Ported from build-log.
export default function FancySelect({
  value,
  options,
  onChange,
  ariaLabel,
  placeholder = 'Select',
  includeClear = false,
  clearLabel = 'None',
  className = '',
}: {
  value: string | undefined
  options: FancyOption[]
  onChange: (value: string | undefined) => void
  ariaLabel: string
  placeholder?: string
  includeClear?: boolean
  clearLabel?: string
  className?: string
}) {
  const rows = options.length + (includeClear ? 1 : 0)
  const { open, pos, triggerRef, panelRef, toggle, close } = usePopover({
    estHeight: rows * 42 + 12,
    minWidth: 180,
  })
  const cur = options.find((o) => o.value === value) ?? null

  const choose = (v: string | undefined) => {
    onChange(v)
    close()
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={toggle}
        className={`inline-flex w-full items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-left font-sans text-[17.5px] text-ink outline-none transition hover:border-white/25 focus:border-accent-violet/60 ${
          open ? 'border-accent-violet/60' : ''
        } ${className}`}
    >
        {cur?.color && <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: cur.color, boxShadow: `0 0 8px ${cur.color}` }} />}
        <span className={`truncate ${cur ? '' : 'text-faint'}`}>{cur ? cur.label : placeholder}</span>
        <svg className={`ml-auto h-3.5 w-3.5 shrink-0 opacity-70 transition ${open ? 'rotate-180' : ''}`} viewBox="0 0 12 12" fill="none">
          <path d="M3 4.5 6 7.5 9 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open &&
        pos &&
        createPortal(
          <ul
            ref={panelRef}
            role="listbox"
            style={{ position: 'fixed', top: pos.top, left: pos.left, minWidth: pos.width, maxHeight: '52vh' }}
            className="z-[999] overflow-y-auto rounded-xl border border-white/15 bg-[#11121f] p-1.5 shadow-2xl ring-1 ring-black/50"
          >
            {includeClear && (
              <li>
                <button
                  onClick={() => choose(undefined)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-[17.5px] text-faint transition hover:bg-white/[0.07]"
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-600" />
                  <span>{clearLabel}</span>
                  {value == null && <span className="ml-auto text-accent-mint">✓</span>}
                </button>
              </li>
            )}
            {options.map((o) => (
              <li key={o.value}>
                <button
                  onClick={() => choose(o.value)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-[17.5px] font-medium transition hover:bg-white/[0.07] ${
                    value === o.value ? 'text-ink' : 'text-subtle'
                  }`}
                >
                  {o.color ? (
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: o.color, boxShadow: `0 0 8px ${o.color}` }} />
                  ) : (
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-white/15" />
                  )}
                  <span className="truncate">{o.label}</span>
                  {value === o.value && <span className="ml-auto text-accent-mint">✓</span>}
                </button>
              </li>
            ))}
          </ul>,
          document.body,
        )}
    </>
  )
}
