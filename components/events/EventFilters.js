import { CalendarDays, LocateFixed, Search, SlidersHorizontal, X } from 'lucide-react';
import { DATE_OPTIONS, INTENT_OPTIONS, SPORT_OPTIONS } from '../../lib/eventFormatters';

// Base field styling WITHOUT horizontal padding, so per-field padding (icon vs
// plain) can't be clobbered by a shorthand `px-*` on the same element.
const fieldBase =
  'h-11 rounded-xl border border-border bg-card text-sm text-foreground outline-none transition-colors focus:border-yellow-500';
const fieldPlain = `${fieldBase} px-3`; // no leading icon
// A global `input:not(...)` reset (specificity 0,4,1) beats the plain `.pl-10`
// class, so icon inputs need the important modifier to clear the leading icon.
const fieldIcon = `${fieldBase} !pl-10 pr-3`; // leading icon (inputs)
const selectIcon = `${fieldBase} !pl-10 pr-8`; // leading icon + native arrow (selects)

// Leading icon: pinned left, perfectly centered, non-interactive.
const iconClass =
  'absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none';

export default function EventFilters({ filters, onChange, onReset }) {
  const hasFilters = Object.entries(filters).some(
    ([key, value]) => key !== 'radius' && value && value !== 'all',
  );

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <SlidersHorizontal className="h-4 w-4 text-yellow-500" />
          Find your next event
        </div>
        {hasFilters && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-muted-foreground hover:text-yellow-500 flex items-center gap-1"
          >
            <X className="h-3.5 w-3.5" /> Reset
          </button>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <label className="relative block xl:col-span-2">
          <span className="sr-only">Search events</span>
          <Search className={iconClass} />
          <input
            value={filters.q}
            onChange={(event) => onChange('q', event.target.value)}
            placeholder="Search events or organizers"
            className={`${fieldIcon} w-full`}
          />
        </label>

        <label className="block">
          <span className="sr-only">Sport</span>
          <select
            value={filters.sport}
            onChange={(event) => onChange('sport', event.target.value)}
            className={`${fieldPlain} w-full`}
          >
            {SPORT_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.emoji} {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="relative block">
          <span className="sr-only">Location</span>
          <LocateFixed className={iconClass} />
          <input
            value={filters.location}
            onChange={(event) => onChange('location', event.target.value)}
            placeholder="City or ZIP"
            className={`${fieldIcon} w-full`}
          />
        </label>

        <label className="block">
          <span className="sr-only">Distance</span>
          <select
            value={filters.radius}
            onChange={(event) => onChange('radius', event.target.value)}
            className={`${fieldPlain} w-full`}
          >
            <option value="25">Within 25 miles</option>
            <option value="50">Within 50 miles</option>
            <option value="100">Within 100 miles</option>
            <option value="250">Within 250 miles</option>
            <option value="any">Any distance</option>
          </select>
        </label>
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        <div className="relative">
          <CalendarDays className={iconClass} />
          <select
            value={filters.date}
            onChange={(event) => onChange('date', event.target.value)}
            className={selectIcon}
          >
            {DATE_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <select
          value={filters.intent}
          onChange={(event) => onChange('intent', event.target.value)}
          className={fieldPlain}
          aria-label="Event intent"
        >
          {INTENT_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>

        <label className="h-11 px-4 rounded-xl border border-border flex items-center gap-2 cursor-pointer hover:border-yellow-500 transition-colors">
          <input
            type="checkbox"
            checked={filters.registration === 'open'}
            onChange={(event) => onChange('registration', event.target.checked ? 'open' : 'all')}
            className="accent-yellow-400"
          />
          <span className="text-sm text-foreground">Entry open</span>
        </label>
      </div>
    </div>
  );
}
