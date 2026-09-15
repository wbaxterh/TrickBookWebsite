import { LocateFixed, Search, SlidersHorizontal, X } from 'lucide-react';

const fieldBase =
  'h-11 rounded-xl border border-border bg-card text-sm text-foreground outline-none transition-colors focus:border-yellow-500';
const fieldPlain = `${fieldBase} px-3`;
const fieldIcon = `${fieldBase} !pl-10 pr-3`;
const iconClass =
  'absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none';

export const SHOP_SPORTS = [
  ['all', 'All sports'],
  ['skateboarding', 'Skateboarding'],
  ['snowboarding', 'Snowboarding'],
  ['skiing', 'Skiing'],
  ['surfing', 'Surfing'],
  ['bmx', 'BMX'],
  ['mtb', 'Mountain biking'],
  ['rollerblading', 'Rollerblading'],
];

export const SHOP_SERVICES = [
  ['all', 'All services'],
  ['gear', 'Gear'],
  ['repairs', 'Repairs & service'],
  ['rentals', 'Rentals'],
  ['apparel', 'Apparel'],
  ['online', 'Online shop'],
];

export default function ShopFilters({ filters, onChange, onReset }) {
  const hasFilters = Object.entries(filters).some(
    ([key, value]) => key !== 'radius' && value && value !== 'all',
  );

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <SlidersHorizontal className="h-4 w-4 text-yellow-500" /> Find a local shop
        </div>
        {hasFilters && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-yellow-500"
          >
            <X className="h-3.5 w-3.5" /> Reset
          </button>
        )}
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <label className="relative block xl:col-span-2">
          <span className="sr-only">Search shops</span>
          <Search className={iconClass} />
          <input
            value={filters.q}
            onChange={(event) => onChange('q', event.target.value)}
            placeholder="Search shops"
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
            {SHOP_SPORTS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
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
      <div className="mt-3">
        <select
          value={filters.service}
          onChange={(event) => onChange('service', event.target.value)}
          className={fieldPlain}
          aria-label="Shop service"
        >
          {SHOP_SERVICES.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
