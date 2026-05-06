import {
  ArrowLeft,
  ChevronDown,
  Filter,
  Globe,
  List,
  Loader2,
  Map as MapIcon,
  MapPin,
  Plus,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Link from 'next/link';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../auth/AuthContext';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
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
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'

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

  // Filter spots by category
  useEffect(() => {
    if (selectedCategory === 'all') {
      setSpotsByState(allSpots);
    } else {
      const filtered = {};
      Object.keys(allSpots).forEach((state) => {
        const filteredSpots = allSpots[state].filter(
          (spot) =>
            spot.sportTypes?.includes(selectedCategory) || spot.category === selectedCategory,
        );
        if (filteredSpots.length > 0) {
          filtered[state] = filteredSpots;
        }
      });
      setSpotsByState(filtered);
    }
  }, [selectedCategory, allSpots]);

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
        {/* Hero Section */}
        <section className="border-b border-border">
          <div className="container py-12 md:py-20">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="flex items-center gap-3">
                <MapPin className="h-10 w-10 text-yellow-500" />
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                  Find the Best Spots to Ride
                </h1>
              </div>
              <p className="text-xl text-muted-foreground max-w-2xl">
                {loading
                  ? 'Loading spots...'
                  : `Discover ${totalSpots} spots across ${sortedCountries.length} countries worldwide`}
              </p>

              {/* Filters Row */}
              <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
                {/* Category Filter */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowCategoryDropdown(!showCategoryDropdown);
                      setShowCountryDropdown(false);
                    }}
                    className="flex items-center gap-3 px-5 py-3 bg-card border border-border rounded-xl hover:border-yellow-500 transition-all"
                  >
                    <Filter className="h-5 w-5 text-yellow-500" />
                    <span className="text-xl">{selectedCategoryData?.emoji}</span>
                    <span className="font-medium">{selectedCategoryData?.name}</span>
                    <ChevronDown
                      className={`h-5 w-5 text-muted-foreground transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {showCategoryDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden min-w-[220px]">
                      {SPORT_CATEGORIES.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => {
                            setSelectedCategory(category.id);
                            setShowCategoryDropdown(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-left ${
                            selectedCategory === category.id
                              ? 'bg-yellow-500/10 text-yellow-500'
                              : ''
                          }`}
                        >
                          <span className="text-xl">{category.emoji}</span>
                          <span className="font-medium">{category.name}</span>
                          {selectedCategory === category.id && (
                            <span className="ml-auto text-yellow-500">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Country Filter */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowCountryDropdown(!showCountryDropdown);
                      setShowCategoryDropdown(false);
                    }}
                    className="flex items-center gap-3 px-5 py-3 bg-card border border-border rounded-xl hover:border-yellow-500 transition-all"
                  >
                    <Globe className="h-5 w-5 text-yellow-500" />
                    <span className="text-xl">
                      {selectedCountry === 'all' ? '🌍' : COUNTRIES[selectedCountry]?.flag}
                    </span>
                    <span className="font-medium">
                      {selectedCountry === 'all'
                        ? 'All Countries'
                        : COUNTRIES[selectedCountry]?.name}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 text-muted-foreground transition-transform ${showCountryDropdown ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {showCountryDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden min-w-[220px] max-h-[400px] overflow-y-auto">
                      <button
                        onClick={() => {
                          setSelectedCountry('all');
                          setShowCountryDropdown(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-left ${
                          selectedCountry === 'all' ? 'bg-yellow-500/10 text-yellow-500' : ''
                        }`}
                      >
                        <span className="text-xl">🌍</span>
                        <span className="font-medium">All Countries</span>
                        {selectedCountry === 'all' && (
                          <span className="ml-auto text-yellow-500">✓</span>
                        )}
                      </button>
                      {Object.entries(COUNTRIES).map(([code, country]) => (
                        <button
                          key={code}
                          onClick={() => {
                            setSelectedCountry(code);
                            setShowCountryDropdown(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-left ${
                            selectedCountry === code ? 'bg-yellow-500/10 text-yellow-500' : ''
                          }`}
                        >
                          <span className="text-xl">{country.flag}</span>
                          <span className="font-medium">{country.name}</span>
                          {selectedCountry === code && (
                            <span className="ml-auto text-yellow-500">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* View Toggle */}
                <div className="flex items-center bg-card border border-border rounded-xl overflow-hidden">
                  <button
                    onClick={() => setViewMode('map')}
                    className={`flex items-center gap-2 px-4 py-3 transition-all ${
                      viewMode === 'map'
                        ? 'bg-yellow-500 text-black font-medium'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <MapIcon className="h-5 w-5" />
                    <span className="hidden sm:inline">Map</span>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex items-center gap-2 px-4 py-3 transition-all ${
                      viewMode === 'list'
                        ? 'bg-yellow-500 text-black font-medium'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <List className="h-5 w-5" />
                    <span className="hidden sm:inline">List</span>
                  </button>
                </div>

                {/* Add Spot Button */}
                <Link href={loggedIn ? '/spots/add' : '/login?redirect=/spots/add'}>
                  <button className="flex items-center gap-2 px-5 py-3 bg-yellow-500 text-black font-medium rounded-xl hover:bg-yellow-400 transition-all">
                    <Plus className="h-5 w-5" />
                    <span>Add Spot</span>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Map View */}
        {viewMode === 'map' && (
          <section className="container py-8">
            <SpotsMap selectedCategory={selectedCategory} selectedCountry={selectedCountry} />
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
                    <span className="text-yellow-500 ml-2">
                      • {selectedCategoryData?.emoji} {selectedCategoryData?.name}
                    </span>
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
