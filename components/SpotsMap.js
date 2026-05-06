import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { APIProvider, Map as GoogleMap, InfoWindow, useMap } from '@vis.gl/react-google-maps';
import { Loader2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

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
          fillOpacity: 1,
          strokeColor: '#1a1a1a',
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

function ClusteredMarkers({ pins, onMarkerClick, selectedPin }) {
  const map = useMap();
  const clustererRef = useRef(null);

  useEffect(() => {
    if (!map) return;

    // Clean up previous clusterer
    if (clustererRef.current) {
      clustererRef.current.clearMarkers();
      clustererRef.current.setMap(null);
    }

    const validPins = pins.filter((p) => p.latitude && p.longitude);

    const markers = validPins.map((pin) => {
      const color = CATEGORY_COLORS[pin.category] || CATEGORY_COLORS.default;
      const marker = new google.maps.Marker({
        position: { lat: pin.latitude, lng: pin.longitude },
        title: pin.name,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
            `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="32" viewBox="0 0 24 32">
              <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 20 12 20s12-11 12-20C24 5.373 18.627 0 12 0z" fill="${color}"/>
              <circle cx="12" cy="12" r="5" fill="white" opacity="0.9"/>
            </svg>`,
          )}`,
          scaledSize: new google.maps.Size(24, 32),
          anchor: new google.maps.Point(12, 32),
        },
      });

      marker.addListener('click', () => {
        onMarkerClick(pin);
      });

      return marker;
    });

    clustererRef.current = new MarkerClusterer({
      map,
      markers,
      renderer: createClusterRenderer(),
    });

    return () => {
      if (clustererRef.current) {
        clustererRef.current.clearMarkers();
        clustererRef.current.setMap(null);
      }
    };
  }, [map, pins, onMarkerClick]);

  return selectedPin ? (
    <InfoWindow
      position={{ lat: selectedPin.latitude, lng: selectedPin.longitude }}
      onCloseClick={() => onMarkerClick(null)}
      pixelOffset={[0, -32]}
    >
      <div className="p-1 max-w-[200px]">
        <h3 className="font-semibold text-sm text-gray-900 mb-1">{selectedPin.name}</h3>
        <p className="text-xs text-gray-600 mb-2">
          {[selectedPin.state, selectedPin.country].filter(Boolean).join(', ')}
        </p>
        {selectedPin.category && (
          <span
            className="inline-block px-2 py-0.5 rounded-full text-xs font-medium text-white mb-2"
            style={{
              backgroundColor: CATEGORY_COLORS[selectedPin.category] || CATEGORY_COLORS.default,
            }}
          >
            {selectedPin.category}
          </span>
        )}
      </div>
    </InfoWindow>
  ) : null;
}

export default function SpotsMap({ selectedCategory = 'all', selectedCountry = 'all' }) {
  const [allPins, setAllPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPin, setSelectedPin] = useState(null);
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

  // Filter pins based on selected category and country
  const pins = allPins.filter((pin) => {
    if (selectedCategory !== 'all') {
      const matchesCategory = pin.category === selectedCategory;
      const matchesSport =
        Array.isArray(pin.sportTypes) && pin.sportTypes.includes(selectedCategory);
      if (!matchesCategory && !matchesSport) return false;
    }
    if (selectedCountry !== 'all') {
      if (pin.country !== selectedCountry) return false;
    }
    return true;
  });

  const handleMarkerClick = useCallback((pin) => {
    setSelectedPin(pin);
  }, []);

  if (!MAPS_KEY) {
    return (
      <div className="w-full h-[70vh] bg-card border border-border rounded-xl flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-2">Google Maps API key not configured</p>
          <p className="text-xs text-muted-foreground">
            Add NEXT_PUBLIC_GOOGLE_MAPS_KEY to your environment variables
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full h-[70vh] bg-card border border-border rounded-xl flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
        <span className="ml-3 text-muted-foreground">Loading spots...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[70vh] bg-card border border-border rounded-xl flex items-center justify-center">
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[70vh] rounded-xl overflow-hidden border border-border">
      <APIProvider apiKey={MAPS_KEY}>
        <GoogleMap
          defaultCenter={{ lat: 35, lng: -30 }}
          defaultZoom={3}
          gestureHandling="greedy"
          disableDefaultUI={false}
          style={{ width: '100%', height: '100%' }}
        >
          <ClusteredMarkers
            pins={pins}
            onMarkerClick={handleMarkerClick}
            selectedPin={selectedPin}
          />
        </GoogleMap>
      </APIProvider>
      <div className="bg-card border-t border-border px-4 py-2 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {pins.length.toLocaleString()} spots worldwide
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
