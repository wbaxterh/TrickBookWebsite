import { ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import { useId, useRef, useState } from 'react';
import { selectedFilterCount } from '../lib/discoveryFilters';
import styles from './DiscoveryFilters.module.css';

export default function DiscoveryFilters({
  title,
  filters,
  advancedKeys,
  onReset,
  search,
  sport,
  children,
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const toggle = useRef(null);
  const searchField = useRef(null);
  const count = selectedFilterCount(filters, advancedKeys);

  return (
    <div className="rounded-2xl border border-border bg-card p-3 shadow-sm md:p-4">
      <div className="mb-3 flex min-h-8 items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <SlidersHorizontal className="h-4 w-4 shrink-0 text-yellow-500" aria-hidden="true" />
          {title}
        </div>
        {selectedFilterCount(filters) > 0 && (
          <button
            type="button"
            onClick={() => {
              onReset();
              if (toggle.current?.getClientRects().length) toggle.current.focus();
              else searchField.current?.querySelector('input')?.focus();
            }}
            className="inline-flex min-h-11 shrink-0 items-center gap-1 px-2 text-sm text-muted-foreground hover:text-yellow-500"
          >
            <X className="h-4 w-4" aria-hidden="true" /> Reset
          </button>
        )}
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 md:grid-cols-2">
        <div ref={searchField} className="col-span-2 min-w-0 md:col-span-1">
          {search}
        </div>
        <div className="min-w-0">{sport}</div>
        <button
          ref={toggle}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((current) => !current)}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border px-3 text-sm font-semibold text-foreground hover:border-yellow-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-500 md:hidden"
        >
          Filters ({count}){' '}
          <ChevronDown className={`h-4 w-4 ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>
      </div>
      <section
        id={panelId}
        aria-label="More filters"
        className={styles.advanced}
        data-open={open}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && toggle.current?.getClientRects().length) {
            setOpen(false);
            toggle.current.focus();
          }
        }}
      >
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{children}</div>
      </section>
    </div>
  );
}
