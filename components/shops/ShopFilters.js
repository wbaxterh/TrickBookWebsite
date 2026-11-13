import { LocateFixed, Search } from 'lucide-react';
import DiscoveryFilters from '../DiscoveryFilters';

const fieldBase =
  'h-11 min-w-0 rounded-xl border border-border bg-card text-base md:text-sm text-foreground outline-none transition-colors focus:border-yellow-500';
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
  return (
    <DiscoveryFilters
      title="Find a local shop"
      filters={filters}
      advancedKeys={['location', 'radius', 'service']}
      onReset={onReset}
      search={
        <label className="relative block">
          <span className="sr-only">Search shops</span>
          <Search className={iconClass} />
          <input
            value={filters.q}
            onChange={(event) => onChange('q', event.target.value)}
            placeholder="Search shops"
            className={`${fieldIcon} w-full`}
          />
        </label>
      }
      sport={
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
      }
    >
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
          aria-label="Distance"
          aria-describedby="shop-distance-help"
          onChange={(event) => onChange('radius', event.target.value)}
          className={`${fieldPlain} w-full`}
        >
          <option value="25">Within 25 miles</option>
          <option value="50">Within 50 miles</option>
          <option value="100">Within 100 miles</option>
          <option value="250">Within 250 miles</option>
          <option value="any">Any distance</option>
        </select>
        <span id="shop-distance-help" className="mt-1 block text-xs text-muted-foreground">
          Requires your location.
        </span>
      </label>
      <select
        value={filters.service}
        onChange={(event) => onChange('service', event.target.value)}
        className={`${fieldPlain} w-full`}
        aria-label="Shop service"
      >
        {SHOP_SERVICES.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </DiscoveryFilters>
  );
}
