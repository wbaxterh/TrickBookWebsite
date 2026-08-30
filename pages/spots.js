import { ArrowLeft, List, Loader2, Map as MapIcon, MapPin, Plus } from 'lucide-react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Link from 'next/link';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../auth/AuthContext';
import SpotDetailPanel from '../components/spots/SpotDetailPanel';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { getSpotsByState } from '../lib/apiSpots';

// Dynamic import to avoid SSR issues with Google Maps
const SpotsMap = dynamic(() => import('../components/SpotsMap'), { ssr: false });

// Sport categories with emojis
const SPORT_CATEGORIES = [
  { id: 'all', name: 'All Sports', emoji: '🎯' },
  { id: 'skateboarding', name: 'Skateboarding', emoji: '🛹' },
  { id: 'snowboarding', name: 'Snowboarding', emoji: '🏂' },
  { id: 'skiing', name: 'Skiing', emoji: '⛷️' },
  { id: 'bmx', name: 'BMX', emoji: '🚴' },
  { id: 'mtb', name: 'Mountain Biking', emoji: '🚵' },
  { id: 'scooter', name: 'Scooter', emoji: '🛴' },
  { id: 'surfing', name: 'Surfing', emoji: '🏄' },
  { id: 'wakeboarding', name: 'Wakeboarding', emoji: '🌊' },
  { id: 'rollerblading', name: 'Rollerblading', emoji: '🛼' },
];

// Venue types (spot categories) — matches the backend `category`
const SPOT_TYPES = [
  { id: 'all', name: 'All Types' },
  { id: 'park', name: 'Park' },
  { id: 'street', name: 'Street' },
  { id: 'backcountry', name: 'Backcountry' },
  { id: 'resort', name: 'Resort' },
  { id: 'indoor', name: 'Indoor' },
  { id: 'diy', name: 'DIY' },
  { id: 'other', name: 'Other' },
];

// Which venue types make sense for each sport. Snow concepts (backcountry,
// resort) don't apply to skate-style sports, and street/diy don't apply to
// surfing, etc. A sport not listed here (and 'all') shows every type; 'All
// Types' is always available.
const SPORT_TYPE_APPLICABILITY = {
  skateboarding: ['park', 'street', 'indoor', 'diy', 'other'],
  bmx: ['park', 'street', 'indoor', 'diy', 'other'],
  scooter: ['park', 'street', 'indoor', 'diy', 'other'],
  rollerblading: ['park', 'street', 'indoor', 'diy', 'other'],
  snowboarding: ['park', 'street', 'backcountry', 'resort', 'indoor', 'other'],
  skiing: ['park', 'street', 'backcountry', 'resort', 'indoor', 'other'],
  mtb: ['park', 'backcountry', 'resort', 'other'],
  wakeboarding: ['park', 'other'],
  surfing: ['other'],
};

// The venue types to show for a given sport (always includes 'all').
function typesForSport(sportId) {
  const applicable = SPORT_TYPE_APPLICABILITY[sportId];
  if (!applicable) return SPOT_TYPES;
  return SPOT_TYPES.filter((t) => t.id === 'all' || applicable.includes(t.id));
}

// Country codes and names with flag emojis
const COUNTRIES = {
  US: { name: 'United States', flag: '🇺🇸' },
  CA: { name: 'Canada', flag: '🇨🇦' },
  GB: { name: 'United Kingdom', flag: '🇬🇧' },
  AU: { name: 'Australia', flag: '🇦🇺' },
  DE: { name: 'Germany', flag: '🇩🇪' },
  FR: { name: 'France', flag: '🇫🇷' },
  JP: { name: 'Japan', flag: '🇯🇵' },
  ES: { name: 'Spain', flag: '🇪🇸' },
  IT: { name: 'Italy', flag: '🇮🇹' },
  NZ: { name: 'New Zealand', flag: '🇳🇿' },
  CH: { name: 'Switzerland', flag: '🇨🇭' },
  AT: { name: 'Austria', flag: '🇦🇹' },
  MX: { name: 'Mexico', flag: '🇲🇽' },
  BR: { name: 'Brazil', flag: '🇧🇷' },
  NL: { name: 'Netherlands', flag: '🇳🇱' },
  SE: { name: 'Sweden', flag: '🇸🇪' },
  NO: { name: 'Norway', flag: '🇳🇴' },
  PT: { name: 'Portugal', flag: '🇵🇹' },
  ZA: { name: 'South Africa', flag: '🇿🇦' },
  ID: { name: 'Indonesia', flag: '🇮🇩' },
};

// US State names mapping
const STATE_NAMES = {
  AL: 'Alabama',
  AK: 'Alaska',
  AZ: 'Arizona',
  AR: 'Arkansas',
  CA: 'California',
  CO: 'Colorado',
  CT: 'Connecticut',
  DE: 'Delaware',
  FL: 'Florida',
  GA: 'Georgia',
  HI: 'Hawaii',
  ID: 'Idaho',
  IL: 'Illinois',
  IN: 'Indiana',
  IA: 'Iowa',
  KS: 'Kansas',
  KY: 'Kentucky',
  LA: 'Louisiana',
  ME: 'Maine',
  MD: 'Maryland',
  MA: 'Massachusetts',
  MI: 'Michigan',
  MN: 'Minnesota',
  MS: 'Mississippi',
  MO: 'Missouri',
  MT: 'Montana',
  NE: 'Nebraska',
  NV: 'Nevada',
  NH: 'New Hampshire',
  NJ: 'New Jersey',
  NM: 'New Mexico',
  NY: 'New York',
  NC: 'North Carolina',
  ND: 'North Dakota',
  OH: 'Ohio',
  OK: 'Oklahoma',
  OR: 'Oregon',
  PA: 'Pennsylvania',
  RI: 'Rhode Island',
  SC: 'South Carolina',
  SD: 'South Dakota',
  TN: 'Tennessee',
  TX: 'Texas',
  UT: 'Utah',
  VT: 'Vermont',
  VA: 'Virginia',
  WA: 'Washington',
  WV: 'West Virginia',
  WI: 'Wisconsin',
  WY: 'Wyoming',
  DC: 'Washington D.C.',
};

export default function Spots() {
  const { loggedIn } = useContext(AuthContext);
  const [spotsByState, setSpotsByState] = useState({});
  const [spotsByCountry, setSpotsByCountry] = useState({});
  const [allSpots, setAllSpots] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all'); // sport
  const [selectedType, setSelectedType] = useState('all'); // venue type (category)
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'
  const [selectedSpot, setSelectedSpot] = useState(null); // pin clicked on the map

  // Venue types available for the selected sport (hides e.g. Backcountry for skateboarding)
  const availableTypes = typesForSport(selectedCategory);

  // Switch sport, and clear the type filter if it no longer applies to that sport
  const handleSportChange = (sportId) => {
    setSelectedCategory(sportId);
    const applicable = SPORT_TYPE_APPLICABILITY[sportId];
    if (applicable && selectedType !== 'all' && !applicable.includes(selectedType)) {
      setSelectedType('all');
    }
  };

  // All US state codes (uppercase) for identifying US spots
  const US_STATE_CODES = new Set(Object.keys(STATE_NAMES));

  // Known country names that appear in the state field
  const COUNTRY_NAMES_IN_STATE = new Set([
    'France',
    'Japan',
    'Canada',
    'Austria',
    'Spain',
    'Switzerland',
    'Italy',
    'New Zealand',
    'Slovenia',
    'Germany',
    'Australia',
    'Sweden',
    'Norway',
    'Russia',
    'South Korea',
    'Poland',
    'Finland',
    'Chile',
    'United Kingdom',
    'Bulgaria',
    'Iran',
    'Slovakia',
    'Turkey',
    'Pakistan',
    'Morocco',
    'North Macedonia',
    'Belgium',
    'Greece',
    'Croatia',
    'Belarus',
    'Andorra',
    'Serbia',
    'Kazakhstan',
    'Ukraine',
    'Romania',
    'Lebanon',
    'Armenia',
    'Iceland',
    'Czech Republic',
    'South Africa',
    'Algeria',
    'Mongolia',
    'Portugal',
    'Mexico',
    'Liechtenstein',
    'Hungary',
    'Georgia',
    'Bosnia',
    'Argentina',
    'International',
    'United States',
  ]);

  // Map country names to codes for flag display
  const COUNTRY_NAME_TO_CODE = {};
  Object.entries(COUNTRIES).forEach(([code, { name }]) => {
    COUNTRY_NAME_TO_CODE[name] = code;
  });

  useEffect(() => {
    const fetchSpots = async () => {
      setLoading(true);
      try {
        const countryFilter = selectedCountry === 'all' ? null : selectedCountry;
        const data = await getSpotsByState(countryFilter);
        setAllSpots(data);
        setSpotsByState(data);
      } catch (_error) {
      } finally {
        setLoading(false);
      }
    };
    fetchSpots();
  }, [selectedCountry]);

  // Filter spots by sport type AND venue type (category)
  useEffect(() => {
    if (selectedCategory === 'all' && selectedType === 'all') {
      setSpotsByState(allSpots);
      return;
    }
    const bySport = (spot) =>
      selectedCategory === 'all' || spot.sportTypes?.includes(selectedCategory);
    const byType = (spot) => selectedType === 'all' || spot.category === selectedType;
    const filtered = {};
    Object.keys(allSpots).forEach((state) => {
      const filteredSpots = allSpots[state].filter((spot) => bySport(spot) && byType(spot));
      if (filteredSpots.length > 0) {
        filtered[state] = filteredSpots;
      }
    });
    setSpotsByState(filtered);
  }, [selectedCategory, selectedType, allSpots]);

  // Organize spots into country → state hierarchy
  const organizeByCountry = () => {
    const countries = {};

    Object.keys(spotsByState).forEach((stateKey) => {
      if (!stateKey || stateKey === 'Unknown') return;
      const spots = spotsByState[stateKey];

      if (US_STATE_CODES.has(stateKey)) {
        // US state code (CA, NY, etc.)
        if (!countries['United States']) countries['United States'] = { total: 0, states: {} };
        countries['United States'].states[stateKey] = spots;
        countries['United States'].total += spots.length;
      } else if (stateKey === 'United States') {
        // Spots with state="United States" (missing proper state)
        if (!countries['United States']) countries['United States'] = { total: 0, states: {} };
        if (!countries['United States'].states['_unassigned'])
          countries['United States'].states['_unassigned'] = [];
        countries['United States'].states['_unassigned'].push(...spots);
        countries['United States'].total += spots.length;
      } else if (COUNTRY_NAMES_IN_STATE.has(stateKey)) {
        // International country in state field
        if (!countries[stateKey]) countries[stateKey] = { total: 0, states: {} };
        countries[stateKey].states['_all'] = spots;
        countries[stateKey].total += spots.length;
      } else if (stateKey === 'ON' || stateKey === 'NS') {
        // Canadian provinces
        if (!countries['Canada']) countries['Canada'] = { total: 0, states: {} };
        countries['Canada'].states[stateKey] = spots;
        countries['Canada'].total += spots.length;
      } else if (stateKey === 'NSW') {
        // Australian states
        if (!countries['Australia']) countries['Australia'] = { total: 0, states: {} };
        countries['Australia'].states[stateKey] = spots;
        countries['Australia'].total += spots.length;
      } else {
        // Unknown — group under "Other"
        if (!countries['Other']) countries['Other'] = { total: 0, states: {} };
        countries['Other'].states[stateKey] = spots;
        countries['Other'].total += spots.length;
      }
    });

    return countries;
  };

  const organizedCountries = organizeByCountry();

  // Sort countries by total spots
  const sortedCountries = Object.keys(organizedCountries).sort(
    (a, b) => organizedCountries[b].total - organizedCountries[a].total,
  );

  const totalSpots = Object.values(organizedCountries).reduce((sum, c) => sum + c.total, 0);

  // Track which country is expanded to show states
  const [expandedCountry, setExpandedCountry] = useState(null);

  const selectedCategoryData = SPORT_CATEGORIES.find((c) => c.id === selectedCategory);

  return (
    <>
      <Head>
        <title>Spots - Find the Best Places to Ride | The Trick Book</title>
        <link rel="icon" href="/favicon.png" />
        <meta
          name="description"
          content="Discover the best spots to ride around the world. Find skateparks, snow resorts, surf breaks, and more for all action sports."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-background">
        {/* Toolbar — slim, left-aligned dashboard header */}
        <div className="border-b border-border sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="container pt-6 pb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-baseline gap-3 min-w-0">
              <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
                <MapPin className="h-6 w-6 text-yellow-500" />
                Spots
              </h1>
              <span className="text-sm text-muted-foreground truncate">
                {loading
                  ? 'Loading…'
                  : `${totalSpots.toLocaleString()} spots · ${sortedCountries.length} countries`}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Sport filter */}
              <Select value={selectedCategory} onValueChange={handleSportChange}>
                <SelectTrigger className="h-9 w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SPORT_CATEGORIES.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Venue type filter (park / street / …) — scoped to the selected sport */}
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="h-9 w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableTypes.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Country filter */}
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger className="h-9 w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {Object.entries(COUNTRIES).map(([code, country]) => (
                    <SelectItem key={code} value={code}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* View toggle */}
              <div className="flex items-center h-9 border border-border rounded-md overflow-hidden">
                <button
                  onClick={() => setViewMode('map')}
                  className={`flex items-center gap-1.5 px-3 h-full text-sm transition-colors ${
                    viewMode === 'map'
                      ? 'bg-yellow-500 text-black font-medium'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <MapIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Map</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-1.5 px-3 h-full text-sm transition-colors ${
                    viewMode === 'list'
                      ? 'bg-yellow-500 text-black font-medium'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <List className="h-4 w-4" />
                  <span className="hidden sm:inline">List</span>
                </button>
              </div>

              {/* Add spot */}
              <Link
                href={loggedIn ? '/spots/add' : '/login?redirect=/spots/add'}
                className="no-underline"
              >
                <Button size="sm" className="h-9">
                  <Plus className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Add Spot</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Map View — full-width map with a spot panel that loads below it */}
        {viewMode === 'map' && (
          <section>
            <SpotsMap
              selectedCategory={selectedCategory}
              selectedType={selectedType}
              selectedCountry={selectedCountry}
              heightClass="h-[56vh] md:h-[62vh]"
              rounded={false}
              onSelectSpot={setSelectedSpot}
            />
            <div className="container py-6">
              {selectedSpot ? (
                <SpotDetailPanel spot={selectedSpot} onClose={() => setSelectedSpot(null)} />
              ) : (
                <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground border border-dashed border-border rounded-xl">
                  <MapPin className="h-4 w-4 text-yellow-500" />
                  Click a pin to preview a spot, add it to a list, or share it with your homies.
                </div>
              )}
            </div>
          </section>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <section className="container py-12">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
                <p className="mt-4 text-muted-foreground">Loading spots...</p>
              </div>
            ) : sortedCountries.length > 0 ? (
              <>
                {/* Back button when viewing a country's states */}
                {expandedCountry && (
                  <button
                    onClick={() => setExpandedCountry(null)}
                    className="flex items-center gap-2 text-muted-foreground hover:text-yellow-500 transition-colors mb-6"
                  >
                    <ArrowLeft className="h-5 w-5" />
                    <span>Back to Countries</span>
                  </button>
                )}

                <h2 className="text-2xl font-semibold text-foreground mb-8 text-center">
                  {expandedCountry ? (
                    <>
                      {COUNTRIES[COUNTRY_NAME_TO_CODE[expandedCountry]]?.flag || '📍'}{' '}
                      {expandedCountry}
                    </>
                  ) : (
                    'Browse by Country'
                  )}
                  {selectedCategory !== 'all' && (
                    <span className="text-yellow-500 ml-2">• {selectedCategoryData?.name}</span>
                  )}
                </h2>

                {!expandedCountry ? (
                  /* Country-level view */
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {sortedCountries.map((countryName) => {
                      const countryData = organizedCountries[countryName];
                      const countryCode = COUNTRY_NAME_TO_CODE[countryName];
                      const flag = COUNTRIES[countryCode]?.flag || '🌍';
                      const stateCount = Object.keys(countryData.states).filter(
                        (s) => s !== '_all' && s !== '_unassigned',
                      ).length;
                      const hasStates =
                        stateCount > 1 || (stateCount === 1 && !countryData.states['_all']);

                      return (
                        <div key={countryName}>
                          {hasStates ? (
                            <Card
                              className="group hover:border-yellow-500 transition-all duration-200 cursor-pointer h-full"
                              onClick={() => setExpandedCountry(countryName)}
                            >
                              <CardContent className="p-6 flex flex-col items-center text-center">
                                <span className="text-3xl mb-2">{flag}</span>
                                <h3 className="font-semibold text-lg text-foreground group-hover:text-yellow-500 transition-colors">
                                  {countryName}
                                </h3>
                                <Badge variant="secondary" className="mt-2">
                                  {countryData.total} spot{countryData.total !== 1 ? 's' : ''}
                                </Badge>
                                <span className="text-xs text-muted-foreground mt-1">
                                  {stateCount} region{stateCount !== 1 ? 's' : ''}
                                </span>
                              </CardContent>
                            </Card>
                          ) : (
                            <Link
                              href={`/spots/${countryName.toLowerCase().replace(/\s+/g, '-')}${selectedCategory !== 'all' ? `?category=${selectedCategory}` : ''}`}
                              className="no-underline"
                            >
                              <Card className="group hover:border-yellow-500 transition-all duration-200 cursor-pointer h-full">
                                <CardContent className="p-6 flex flex-col items-center text-center">
                                  <span className="text-3xl mb-2">{flag}</span>
                                  <h3 className="font-semibold text-lg text-foreground group-hover:text-yellow-500 transition-colors">
                                    {countryName}
                                  </h3>
                                  <Badge variant="secondary" className="mt-2">
                                    {countryData.total} spot{countryData.total !== 1 ? 's' : ''}
                                  </Badge>
                                </CardContent>
                              </Card>
                            </Link>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* State-level view within a country */
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Object.keys(organizedCountries[expandedCountry]?.states || {})
                      .filter((s) => s !== '_unassigned')
                      .sort((a, b) => {
                        const aCount = organizedCountries[expandedCountry].states[a].length;
                        const bCount = organizedCountries[expandedCountry].states[b].length;
                        return bCount - aCount;
                      })
                      .map((stateKey) => {
                        const spots = organizedCountries[expandedCountry].states[stateKey];
                        const displayName =
                          stateKey === '_all' ? expandedCountry : STATE_NAMES[stateKey] || stateKey;
                        const linkSlug =
                          stateKey === '_all'
                            ? expandedCountry.toLowerCase().replace(/\s+/g, '-')
                            : stateKey.toLowerCase();

                        return (
                          <Link
                            key={stateKey}
                            href={`/spots/${linkSlug}${selectedCategory !== 'all' ? `?category=${selectedCategory}` : ''}`}
                            className="no-underline"
                          >
                            <Card className="group hover:border-yellow-500 transition-all duration-200 cursor-pointer h-full">
                              <CardContent className="p-6 flex flex-col items-center text-center">
                                <h3 className="font-semibold text-lg text-foreground group-hover:text-yellow-500 transition-colors">
                                  {displayName}
                                </h3>
                                <Badge variant="secondary" className="mt-2">
                                  {spots.length} spot{spots.length !== 1 ? 's' : ''}
                                </Badge>
                              </CardContent>
                            </Card>
                          </Link>
                        );
                      })}
                    {/* Show unassigned spots count if any */}
                    {organizedCountries[expandedCountry]?.states['_unassigned']?.length > 0 && (
                      <Link
                        href={`/spots/united-states${selectedCategory !== 'all' ? `?category=${selectedCategory}` : ''}`}
                        className="no-underline"
                      >
                        <Card className="group hover:border-yellow-500 transition-all duration-200 cursor-pointer h-full border-dashed">
                          <CardContent className="p-6 flex flex-col items-center text-center">
                            <h3 className="font-semibold text-lg text-muted-foreground group-hover:text-yellow-500 transition-colors">
                              Other / Unassigned
                            </h3>
                            <Badge variant="secondary" className="mt-2">
                              {organizedCountries[expandedCountry].states['_unassigned'].length}{' '}
                              spot
                              {organizedCountries[expandedCountry].states['_unassigned'].length !==
                              1
                                ? 's'
                                : ''}
                            </Badge>
                          </CardContent>
                        </Card>
                      </Link>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <MapPin className="h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-semibold text-foreground mb-2">
                  {selectedCategory !== 'all'
                    ? `No ${selectedCategoryData?.name} spots found`
                    : 'No spots found yet'}
                </h2>
                <p className="text-muted-foreground max-w-md mb-4">
                  {selectedCategory !== 'all'
                    ? 'Try selecting a different category or check back soon!'
                    : 'Check back soon or add spots using our Chrome extension!'}
                </p>
                {selectedCategory !== 'all' && (
                  <Button variant="outline" onClick={() => setSelectedCategory('all')}>
                    Show All Sports
                  </Button>
                )}
              </div>
            )}
          </section>
        )}
      </div>
    </>
  );
}
