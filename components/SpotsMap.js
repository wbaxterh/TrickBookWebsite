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

  if (!selectedPin) return null;

  const spotSlug = selectedPin.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const stateSlug = (selectedPin.state || 'unknown').toLowerCase().replace(/\s+/g, '-');
  const detailUrl = `/spots/${stateSlug}/${spotSlug}`;
  const rating = selectedPin.rating;
  const desc = selectedPin.description;

  return (
    <InfoWindow
      position={{ lat: selectedPin.latitude, lng: selectedPin.longitude }}
      onCloseClick={() => onMarkerClick(null)}
      pixelOffset={[0, -32]}
    >
      <div style={{ maxWidth: 240, padding: 4, fontFamily: 'system-ui, sans-serif' }}>
        <a href={detailUrl} style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 600, color: '#111' }}>
            {selectedPin.name}
          </h3>
        </a>
        <p style={{ margin: '0 0 6px', fontSize: 12, color: '#666' }}>
          {[selectedPin.state, selectedPin.country].filter(Boolean).join(', ')}
        </p>
        {rating > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 6 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <svg
                key={`s${i}`}
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill={i < Math.round(rating) ? '#f59e0b' : '#d1d5db'}
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
            <span style={{ fontSize: 12, color: '#666', marginLeft: 2 }}>{rating.toFixed(1)}</span>
          </div>
        )}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: desc ? 6 : 0 }}>
          {selectedPin.category && (
            <span
              style={{
                display: 'inline-block',
                padding: '2px 8px',
                borderRadius: 99,
                fontSize: 11,
                fontWeight: 500,
                color: '#fff',
                backgroundColor: CATEGORY_COLORS[selectedPin.category] || CATEGORY_COLORS.default,
              }}
            >
              {selectedPin.category}
            </span>
          )}
          {selectedPin.sportTypes?.length > 0 && (
            <span style={{ fontSize: 11, color: '#888' }}>{selectedPin.sportTypes.join(', ')}</span>
          )}
        </div>
        {desc && (
          <p
            style={{
              margin: '0 0 6px',
              fontSize: 12,
              color: '#555',
              lineHeight: 1.4,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {desc}
          </p>
        )}
        <a
          href={detailUrl}
          style={{ fontSize: 12, color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}
        >
          View Details →
        </a>
      </div>
    </InfoWindow>
  );
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
