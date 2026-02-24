import { useCallback, useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import type { CountryContact } from '../data/countryContacts';

interface GoogleMapComponentProps {
  countryContacts: CountryContact[];
  selectedCountry: CountryContact;
  onCountryClick: (countryId: string) => void;
}

const mapContainerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '12px',
};

// Center the map to show all locations (Morocco to Uzbekistan)
const center = {
  lat: 37,
  lng: 33,
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
  styles: [
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#93C5FD' }],
    },
    {
      featureType: 'landscape',
      elementType: 'geometry',
      stylers: [{ color: '#FEF3C7' }],
    },
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
  ],
};

const GoogleMapComponent = ({ countryContacts, selectedCountry, onCountryClick }: GoogleMapComponentProps) => {
  const [activeMarker, setActiveMarker] = useState<string | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  });

  const onLoad = useCallback(() => {
    // Map loaded successfully
  }, []);

  const onUnmount = useCallback(() => {
    // Map unmounted
  }, []);

  const handleMarkerClick = (countryId: string) => {
    setActiveMarker(countryId);
    onCountryClick(countryId);
  };

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-[500px] bg-red-50 rounded-xl border-2 border-red-200">
        <div className="text-center p-8">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-bold text-red-900 mb-2">Map Loading Error</h3>
          <p className="text-red-700 mb-4">Failed to load Google Maps</p>
          <p className="text-sm text-red-600">Please check your API key configuration</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-[500px] bg-blue-50 rounded-xl">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-lg text-blue-900 font-semibold">Loading Map...</p>
        </div>
      </div>
    );
  }

  if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY || import.meta.env.VITE_GOOGLE_MAPS_API_KEY === 'YOUR_API_KEY_HERE') {
    return (
      <div className="flex items-center justify-center h-[500px] bg-yellow-50 rounded-xl border-2 border-yellow-300">
        <div className="text-center p-8 max-w-2xl">
          <svg className="w-16 h-16 text-yellow-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h3 className="text-xl font-bold text-yellow-900 mb-3">Google Maps API Key Required</h3>
          <div className="text-left bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-700 mb-2">To enable the interactive map:</p>
            <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
              <li>Visit <a href="https://console.cloud.google.com/google/maps-apis" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google Cloud Console</a></li>
              <li>Enable "Maps JavaScript API"</li>
              <li>Create an API Key</li>
              <li>Add it to <code className="bg-gray-100 px-2 py-1 rounded">.env</code> file as <code className="bg-gray-100 px-2 py-1 rounded">VITE_GOOGLE_MAPS_API_KEY</code></li>
              <li>Restart the development server</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={4}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={mapOptions}
    >
      {/* Markers for each country */}
      {countryContacts.map((country) => {
        const isSelected = selectedCountry.id === country.id;
        // Convert our stored coordinates to actual lat/lng
        const position = {
          lat: country.coordinates.lat,
          lng: country.coordinates.lng,
        };

        return (
          <Marker
            key={country.id}
            position={position}
            onClick={() => handleMarkerClick(country.id)}
            icon={{
              url: isSelected
                ? 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="40" height="56" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <filter id="shadow">
                          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.4"/>
                        </filter>
                      </defs>
                      <path d="M20 0C12.268 0 6 6.268 6 14c0 10.5 14 42 14 42s14-31.5 14-42c0-7.732-6.268-14-14-14z" fill="#EF4444" filter="url(#shadow)"/>
                      <circle cx="20" cy="14" r="6" fill="white"/>
                      <circle cx="20" cy="14" r="3" fill="#EF4444"/>
                    </svg>
                  `)
                : 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="36" height="50" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <filter id="shadow">
                          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
                        </filter>
                      </defs>
                      <path d="M18 0C10.82 0 5 5.82 5 13c0 9.375 13 37 13 37s13-27.625 13-37c0-7.18-5.82-13-13-13z" fill="#3B82F6" filter="url(#shadow)"/>
                      <circle cx="18" cy="13" r="5" fill="white"/>
                    </svg>
                  `),
              scaledSize: isSelected ? new window.google.maps.Size(40, 56) : new window.google.maps.Size(36, 50),
              anchor: isSelected ? new window.google.maps.Point(20, 56) : new window.google.maps.Point(18, 50),
            }}
            animation={isSelected ? window.google.maps.Animation.BOUNCE : undefined}
          >
            {activeMarker === country.id && (
              <InfoWindow
                position={position}
                onCloseClick={() => setActiveMarker(null)}
              >
                <div className="p-2">
                  <h3 className="font-bold text-lg text-gray-900 mb-1">{country.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{country.city}</p>
                  <div className="text-xs text-gray-700 space-y-1">
                    <p className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                      </svg>
                      {country.email}
                    </p>
                    <p className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                      </svg>
                      {country.phone}
                    </p>
                  </div>
                </div>
              </InfoWindow>
            )}
          </Marker>
        );
      })}
    </GoogleMap>
  );
};

export default GoogleMapComponent;
