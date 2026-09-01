import { MarkerClusterer, SuperClusterViewportAlgorithm } from '@googlemaps/markerclusterer';
import { APIProvider, Map as GoogleMap, useMap } from '@vis.gl/react-google-maps';
import { Loader2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.thetrickbook.com/api';
const MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

const CATEGORY_COLORS = {
  park: '#22c55e',
  street: '#f59e0b',
  indoor: '#3b82f6',
  diy: '#ef4444',
  other: '#8b5cf6',
  default: '#fcf150',
};

function createClusterRenderer() {
  return {
    render: ({ count, position }) => {
      const size = count < 50 ? 40 : count < 200 ? 50 : 60;
      return new google.maps.Marker({
        position,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: size / 2,
          fillColor: '#fcf150',
          fillOpacity: 0.5,
          strokeColor: '#1a1a1a',
          strokeOpacity: 0.6,
          strokeWeight: 3,
        },
        label: {
          text: String(count),
          color: '#1a1a1a',
          fontWeight: '700',
          fontSize: count < 50 ? '13px' : '15px',
        },
        zIndex: count,
      });
    },
  };
}

// One icon descriptor per category color, shared across all markers.
// Built lazily because google.maps.Size/Point need the Maps API loaded.
const iconCache = {};
function getCategoryIcon(color) {
  if (!iconCache[color]) {
    iconCache[color] = {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="32" viewBox="0 0 24 32">
          <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 20 12 20s12-11 12-20C24 5.373 18.627 0 12 0z" fill="${color}"/>
          <circle cx="12" cy="12" r="5" fill="white" opacity="0.9"/>
        </svg>`,
      )}`,
      scaledSize: new google.maps.Size(24, 32),
      anchor: new google.maps.Point(12, 32),
    };
  }
  return iconCache[color];
}

function ClusteredMarkers({ pins, onMarkerClick }) {
  const map = useMap();
  const clustererRef = useRef(null);

  useEffect(() => {
    if (!map) return;

    // Clean up previous clusterer. noDraw=true: rendering with zero markers
    // crashes SuperClusterViewportAlgorithm (see below).
    if (clustererRef.current) {
      clustererRef.current.clearMarkers(true);
      clustererRef.current.setMap(null);
      clustererRef.current = null;
    }

    const validPins = pins.filter((p) => p.latitude && p.longitude);

    // SuperClusterViewportAlgorithm never load()s an empty marker set (deepEqual
    // sees no change from its initial []), then clusters against the unloaded
    // index and throws "reading 'range'". Skip the clusterer until pins exist.
    if (validPins.length === 0) return;

    const markers = validPins.map((pin) => {
      const color = CATEGORY_COLORS[pin.category] || CATEGORY_COLORS.default;
      const marker = new google.maps.Marker({
        position: { lat: pin.latitude, lng: pin.longitude },
        title: pin.name,
        icon: getCategoryIcon(color),
      });

      marker.addListener('click', () => {
        onMarkerClick(pin);
      });

      return marker;
    });

    clustererRef.current = new MarkerClusterer({
      map,
      markers,
      algorithm: new SuperClusterViewportAlgorithm({ maxZoom: 16 }),
      renderer: createClusterRenderer(),
    });

    return () => {
      if (clustererRef.current) {
        clustererRef.current.clearMarkers(true);
        clustererRef.current.setMap(null);
        clustererRef.current = null;
      }
    };
  }, [map, pins, onMarkerClick]);

  // Markers only — the selected spot renders in a panel below the map (handled
  // by the parent via onMarkerClick), not in an on-map InfoWindow.
  return null;
}

function pinMatchesFilters(pin, selectedCategory, selectedType, selectedCountry) {
  // Sport filter matches against the pin's sportTypes.
  if (selectedCategory !== 'all') {
    const matchesSport = Array.isArray(pin.sportTypes) && pin.sportTypes.includes(selectedCategory);
    if (!matchesSport) return false;
  }
  // Venue-type filter matches the pin's category (park/street/backcountry/…).
  if (selectedType !== 'all' && pin.category !== selectedType) return false;
  if (selectedCountry !== 'all' && pin.country !== selectedCountry) return false;
  return true;
}

export default function SpotsMap({
  selectedCategory = 'all',
  selectedType = 'all',
  selectedCountry = 'all',
  onSelectSpot,
  heightClass = 'h-[70vh]',
  rounded = true,
}) {
  const [allPins, setAllPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all spots once
  useEffect(() => {
    fetch(`${API_BASE}/spots/map-pins`)
      .then((res) => {
        if (!res.ok) throw new Error('map-pins not available');
        return res.json();
      })
      .then((data) => {
        setAllPins(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        fetch(`${API_BASE}/spots?limit=5000`)
          .then((res) => res.json())
          .then((data) => {
            const spots = (data.spots || []).map((s) => ({
              _id: s._id,
              name: s.name,
              latitude: s.latitude,
              longitude: s.longitude,
              category: s.category,
              sportTypes: s.sportTypes,
              state: s.state,
              country: s.country,
              rating: s.rating,
              description: s.description,
              imageURL: s.imageURL,
            }));
            setAllPins(spots);
            setLoading(false);
          })
          .catch((err) => {
            console.error('Failed to load spots:', err);
            setError('Failed to load spots');
            setLoading(false);
          });
      });
  }, []);

  // Filter pins based on selected category and country.
  // Memoized so the array identity is stable across unrelated re-renders
  // (e.g., selecting a pin) — otherwise ClusteredMarkers rebuilds every marker.
  const pins = useMemo(
    () =>
      allPins.filter((pin) =>
        pinMatchesFilters(pin, selectedCategory, selectedType, selectedCountry),
      ),
    [allPins, selectedCategory, selectedType, selectedCountry],
  );

  const handleMarkerClick = useCallback(
    (pin) => {
      if (onSelectSpot) onSelectSpot(pin);
    },
    [onSelectSpot],
  );

  const roundClass = rounded ? 'rounded-xl border' : 'border-y';

  if (!MAPS_KEY) {
    return (
      <div
        className={`w-full ${heightClass} bg-card border-border ${roundClass} flex items-center justify-center`}
      >
        <div className="text-center">
          <p className="text-muted-foreground mb-2">Google Maps API key not configured</p>
          <p className="text-xs text-muted-foreground">
            Add NEXT_PUBLIC_GOOGLE_MAPS_KEY to your environment variables
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`w-full ${heightClass} bg-card border-border ${roundClass} flex items-center justify-center`}
      >
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className={`w-full ${heightClass} overflow-hidden border-border ${roundClass} relative`}>
      <APIProvider apiKey={MAPS_KEY}>
        <GoogleMap
          defaultCenter={{ lat: 35, lng: -30 }}
          defaultZoom={3}
          gestureHandling="greedy"
          disableDefaultUI={false}
          style={{ width: '100%', height: '100%' }}
        >
          <ClusteredMarkers pins={pins} onMarkerClick={handleMarkerClick} />
        </GoogleMap>
      </APIProvider>
      {loading && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-card border border-border rounded-full px-4 py-1.5 flex items-center shadow-md">
          <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
          <span className="ml-2 text-sm text-muted-foreground">Loading spots...</span>
        </div>
      )}
      <div className="bg-card border-t border-border px-4 py-2 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {loading ? 'Loading spots...' : `${pins.length.toLocaleString()} spots worldwide`}
        </span>
        <div className="flex gap-3">
          {Object.entries(CATEGORY_COLORS)
            .filter(([key]) => key !== 'default')
            .map(([cat, color]) => (
              <span key={cat} className="flex items-center gap-1 text-xs text-muted-foreground">
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{ backgroundColor: color }}
                />
                {cat}
              </span>
            ))}
        </div>
      </div>
    </div>
  );
}
