
"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import { Search as SearchIcon, LocateFixed } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { barikoiReverseGeocode, barikoiAutocomplete } from '@/lib/barikoi';

// Fix for default icon issue with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png').default,
  iconUrl: require('leaflet/dist/images/marker-icon.png').default,
  shadowUrl: require('leaflet/dist/images/marker-shadow.png').default,
});


interface InteractiveMapProps {
  onLocationSelect: (details: any) => void;
  initialPosition?: [number, number];
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ 
  onLocationSelect,
  initialPosition = [23.8103, 90.4125],
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Initialize and clean up the map
  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      const map = L.map(mapContainerRef.current).setView(initialPosition, 13);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      mapRef.current = map;
      
      // Add initial marker
      markerRef.current = L.marker(initialPosition).addTo(map);
    }
    
    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const updateMapAndView = (lat: number, lng: number, zoom: number = 15) => {
    if (mapRef.current) {
        mapRef.current.setView([lat, lng], zoom);
        if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
        } else {
            markerRef.current = L.marker([lat, lng]).addTo(mapRef.current);
        }
    }
  }

  // Handle map click events
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleClick = async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      updateMapAndView(lat, lng);
      
      try {
        const data = await barikoiReverseGeocode(lat, lng);
        if (data && data.place) {
          onLocationSelect({
            lat, lng,
            division: data.place.division || '', district: data.place.district || '',
            upazila: data.place.thana || data.place.sub_district || '', area: data.place.area || '',
            streetAddress: data.place.address || ''
          });
        }
      } catch (error) {
        console.error('Reverse geocode failed:', error);
      }
    };
    
    map.on('click', handleClick);
    return () => { map.off('click', handleClick); };
  }, [onLocationSelect]);

  // Handle autocomplete search
  useEffect(() => {
    if (debouncedSearchTerm) {
      const fetchSuggestions = async () => {
        try {
          const data = await barikoiAutocomplete(debouncedSearchTerm);
          setSuggestions(data.places || []);
        } catch (error) {
          console.error("Autocomplete search failed:", error);
          setSuggestions([]);
        }
      };
      fetchSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [debouncedSearchTerm]);

  const handleSuggestionClick = (place: any) => {
    const lat = parseFloat(place.latitude);
    const lng = parseFloat(place.longitude);
    
    updateMapAndView(lat, lng);

    setSearchTerm('');
    setSuggestions([]);
    onLocationSelect({
        lat, lng,
        division: place.division || '', district: place.district || '',
        upazila: place.thana || place.sub_district || '', area: place.area || '',
        streetAddress: place.address || ''
    });
  };

  const handleCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        updateMapAndView(latitude, longitude);
        try {
          const data = await barikoiReverseGeocode(latitude, longitude);
          if (data && data.place) {
            onLocationSelect({
                lat: latitude, lng: longitude,
                division: data.place.division || '', district: data.place.district || '',
                upazila: data.place.thana || data.place.sub_district || '', area: data.place.area || '',
                streetAddress: data.place.address || ''
            });
          }
        } catch (error) {
          console.error('Reverse geocode failed:', error);
        }
      },
      (error) => console.error("Geolocation error:", error),
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for a location..."
          className="w-full pl-10 pr-4 py-2 border rounded-lg"
        />
        {suggestions.length > 0 && (
          <ul className="absolute z-50 w-full bg-background border mt-1 rounded-lg max-h-48 overflow-y-auto shadow-lg">
            {suggestions.map((place) => (
              <li
                key={place.id}
                onClick={() => handleSuggestionClick(place)}
                className="p-2 cursor-pointer hover:bg-muted"
              >
                {place.address}
              </li>
            ))}
          </ul>
        )}
      </div>
       <button type="button" onClick={handleCurrentLocation} className="flex items-center justify-center gap-2 p-2 text-sm text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200">
        <LocateFixed size={16} /> Use Current Location
      </button>
      <div id="map-container" ref={mapContainerRef} className="w-full h-full min-h-[300px] rounded-lg overflow-hidden z-0" />
    </div>
  );
};

export default InteractiveMap;
