import { MarkerClusterer, SuperClusterViewportAlgorithm } from '@googlemaps/markerclusterer';
import { APIProvider, Map as GoogleMap, useMap } from '@vis.gl/react-google-maps';
import { Loader2, RefreshCw } from 'lucide-react';
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

function createClusterMarker(count, position) {
  const size = count < 50 ? 40 : count < 200 ? 50 : 60;
  return new google.maps.Marker({
    position,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: size / 2,
      fillColor: '#fcf150',
      fillOpacity: 0.55,
      strokeColor: '#1a1a1a',
      strokeOpacity: 0.65,
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
}

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

function MapMarkers({ pins, serverClusters, onMarkerClick }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return undefined;

    if (serverClusters.length > 0) {
      const markers = serverClusters.map((cluster) => {
        const marker = createClusterMarker(cluster.count, {
          lat: cluster.latitude,
          lng: cluster.longitude,
        });
        marker.setMap(map);
        marker.addListener('click', () => {
          map.panTo(marker.getPosition());
          map.setZoom(Math.min((map.getZoom() || 3) + 2, 18));
        });
        return marker;
      });
      return () => {
        markers.forEach((marker) => {
          marker.setMap(null);
        });
      };
    }

    const validPins = pins.filter(
      (pin) => Number.isFinite(pin.latitude) && Number.isFinite(pin.longitude),
    );
    if (validPins.length === 0) return undefined;

    const markers = validPins.map((pin) => {
      const color = CATEGORY_COLORS[pin.category] || CATEGORY_COLORS.default;
      const marker = new google.maps.Marker({
        position: { lat: pin.latitude, lng: pin.longitude },
        title: pin.name,
        icon: getCategoryIcon(color),
      });
      marker.addListener('click', () => onMarkerClick(pin));
      return marker;
    });
    const clusterer = new MarkerClusterer({
      map,
      markers,
      algorithm: new SuperClusterViewportAlgorithm({ maxZoom: 16 }),
      renderer: { render: ({ count, position }) => createClusterMarker(count, position) },
    });
    return () => {
      clusterer.clearMarkers(true);
      clusterer.setMap(null);
    };
  }, [map, onMarkerClick, pins, serverClusters]);

  return null;
}

function ViewportLoader({ onViewport }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return undefined;
    const emitViewport = () => {
      const bounds = map.getBounds();
      if (!bounds) return;
      const northEast = bounds.getNorthEast();
      const southWest = bounds.getSouthWest();
      onViewport({
        minLat: southWest.lat(),
        maxLat: northEast.lat(),
        minLng: southWest.lng(),
        maxLng: northEast.lng(),
        zoom: map.getZoom() || 3,
      });
    };
    const listener = map.addListener('idle', emitViewport);
    emitViewport();
    return () => listener.remove();
  }, [map, onViewport]);

  return null;
}

export default function SpotsMap({
  selectedCategory = 'all',
  selectedType = 'all',
  selectedCountry = 'all',
  onSelectSpot,
  heightClass = 'h-[70vh]',
  rounded = true,
}) {
  const [pins, setPins] = useState([]);
  const [serverClusters, setServerClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);
  const debounceRef = useRef(null);
  const requestSequenceRef = useRef(0);
  const latestViewportRef = useRef(null);
  const lastViewportKeyRef = useRef(null);

  const loadViewport = useCallback(
    (viewport, force = false) => {
      latestViewportRef.current = viewport;
      const viewportKey = [
        viewport.minLat.toFixed(4),
        viewport.maxLat.toFixed(4),
        viewport.minLng.toFixed(4),
        viewport.maxLng.toFixed(4),
        Math.round(viewport.zoom * 10) / 10,
        selectedCategory,
        selectedType,
        selectedCountry,
      ].join(':');
      if (!force && viewportKey === lastViewportKeyRef.current) return;
      lastViewportKeyRef.current = viewportKey;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        const sequence = ++requestSequenceRef.current;
        const params = new URLSearchParams({
          v: '2',
          minLat: String(viewport.minLat),
          maxLat: String(viewport.maxLat),
          minLng: String(viewport.minLng),
          maxLng: String(viewport.maxLng),
          zoom: String(viewport.zoom),
        });
        if (selectedCategory !== 'all') params.set('sportType', selectedCategory);
        if (selectedType !== 'all') params.set('category', selectedType);
        if (selectedCountry !== 'all') params.set('country', selectedCountry);
        setLoading(true);
        setError(null);
        try {
          const response = await fetch(`${API_BASE}/spots/map-pins?${params}`, {
            signal: controller.signal,
          });
          if (!response.ok) throw new Error(`Map request failed (${response.status})`);
          const data = await response.json();
          if (sequence !== requestSequenceRef.current) return;
          if (data.type === 'clusters') {
            setServerClusters(Array.isArray(data.items) ? data.items : []);
            setPins([]);
          } else {
            setPins(Array.isArray(data.items) ? data.items : []);
            setServerClusters([]);
          }
        } catch (requestError) {
          if (requestError.name !== 'AbortError' && sequence === requestSequenceRef.current) {
            setError('Could not load this area. Check your connection and try again.');
          }
        } finally {
          if (sequence === requestSequenceRef.current) setLoading(false);
        }
      }, 250);
    },
    [selectedCategory, selectedCountry, selectedType],
  );

  useEffect(() => {
    if (latestViewportRef.current) loadViewport(latestViewportRef.current);
  }, [loadViewport]);

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    },
    [],
  );

  const handleMarkerClick = useCallback(
    async (pin) => {
      if (!onSelectSpot) return;
      onSelectSpot({ ...pin, _loading: true });
      try {
        const response = await fetch(`${API_BASE}/spots/${pin._id}`);
        if (!response.ok) throw new Error('Spot detail unavailable');
        onSelectSpot(await response.json());
      } catch {
        onSelectSpot(pin);
      }
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
          <ViewportLoader onViewport={loadViewport} />
          <MapMarkers
            pins={pins}
            serverClusters={serverClusters}
            onMarkerClick={handleMarkerClick}
          />
        </GoogleMap>
      </APIProvider>
      {loading && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-card border border-border rounded-full px-4 py-1.5 flex items-center shadow-md">
          <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
          <span className="ml-2 text-sm text-muted-foreground">Updating this area...</span>
        </div>
      )}
      {error && (
        <div className="absolute inset-x-3 top-3 z-20 mx-auto max-w-md rounded-lg border border-red-500/40 bg-card p-3 shadow-lg flex items-center justify-between gap-3">
          <span className="text-sm text-foreground">{error}</span>
          <button
            type="button"
            onClick={() =>
              latestViewportRef.current && loadViewport(latestViewportRef.current, true)
            }
            className="shrink-0 inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-sm hover:bg-muted"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Retry
          </button>
        </div>
      )}
      <div className="bg-card border-t border-border px-4 py-2 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {loading
            ? 'Updating this area...'
            : serverClusters.length > 0
              ? `${serverClusters.length.toLocaleString()} areas - zoom in for spots`
              : `${pins.length.toLocaleString()} spots in this area`}
        </span>
      </div>
    </div>
  );
}
