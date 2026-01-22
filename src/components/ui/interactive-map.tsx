'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import { Search as SearchIcon, LocateFixed } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { barikoiReverseGeocode, barikoiAutocomplete } from '@/lib/barikoi';
import { useToast } from '@/hooks/use-toast';

// Fix for default icon issue with webpack
if (typeof window !== 'undefined') {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
        iconUrl: require('leaflet/dist/images/marker-icon.png'),
        shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
    });
}


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
  const { toast } = useToast();

  const updateMapAndView = useCallback((lat: number, lng: number, zoom: number = 15) => {
    if (mapRef.current) {
        mapRef.current.setView([lat, lng], zoom);
        if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
        } else {
            markerRef.current = L.marker([lat, lng]).addTo(mapRef.current);
        }
    }
  }, []);

  // Initialize and clean up the map
  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      const map = L.map(mapContainerRef.current).setView(initialPosition, 13);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      mapRef.current = map;
      
      // Add initial marker
      if(markerRef.current){
        markerRef.current.remove();
      }
      markerRef.current = L.marker(initialPosition).addTo(map);
    }
    
    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        if (markerRef.current) {
            markerRef.current.remove();
            markerRef.current = null;
        }
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [initialPosition]);

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
          const area = data.place.area ? `${data.place.area}${data.place.postCode ? ` - ${data.place.postCode}` : ''}` : (data.place.postCode || '');
          onLocationSelect({
            lat, lng,
            division: data.place.division || '', district: data.place.district || '',
            upazila: data.place.thana || data.place.sub_district || '', area: area,
            streetAddress: data.place.address || ''
          });
        }
      } catch (error) {
        console.error('Reverse geocode failed:', error);
      }
    };
    
    map.on('click', handleClick);
    return () => { map.off('click', handleClick); };
  }, [onLocationSelect, updateMapAndView]);

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
    
    const area = place.area ? `${place.area}${place.postCode ? ` - ${place.postCode}` : ''}` : (place.postCode || '');

    onLocationSelect({
        lat, lng,
        division: place.division || '', district: place.district || '',
        upazila: place.thana || place.sub_district || '', area: area,
        streetAddress: place.address || ''
    });
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        variant: 'destructive',
        title: 'Geolocation Not Supported',
        description: 'Your browser does not support geolocation.',
      });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        updateMapAndView(latitude, longitude);
        try {
          const data = await barikoiReverseGeocode(latitude, longitude);
          if (data && data.place) {
            const area = data.place.area ? `${data.place.area}${data.place.postCode ? ` - ${data.place.postCode}` : ''}` : (data.place.postCode || '');
            onLocationSelect({
                lat: latitude, lng: longitude,
                division: data.place.division || '', district: data.place.district || '',
                upazila: data.place.thana || data.place.sub_district || '', area: area,
                streetAddress: data.place.address || ''
            });
          }
        } catch (error) {
          console.error('Reverse geocode failed:', error);
        }
      },
      (error) => {
        let description = 'Please ensure location services are enabled for your browser and this site.';
        if (error.code === 1) { // PERMISSION_DENIED
            description = 'You have denied location access. Please enable it in your browser settings to use this feature.';
        } else if (error.code === 2) { // POSITION_UNAVAILABLE
            description = 'Your location is currently unavailable. Please check your network connection.';
        } else if (error.code === 3) { // TIMEOUT
            description = 'Getting your location took too long. Please try again.';
        }
        
        toast({
          variant: 'destructive',
          title: 'Could Not Get Location',
          description: description,
        });
      },
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
