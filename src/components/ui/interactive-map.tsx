"use client"

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Input } from './input';
import { Button } from './button';
import { LocateFixed } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { barikoi } from '@/lib/barikoi';

// Fix for default icon issue with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png').default,
  iconUrl: require('leaflet/dist/images/marker-icon.png').default,
  shadowUrl: require('leaflet/dist/images/marker-shadow.png').default,
});


interface InteractiveMapProps {
  onLocationSelect: (details: {
    lat: number;
    lng: number;
    division: string;
    district: string;
    upazila: string;
    area: string;
    streetAddress: string;
  }) => void;
  initialPosition: [number, number];
}

function MapController({ center, onLocationSelect }: { center: [number, number], onLocationSelect: (lat: number, lng: number) => void }) {
    const map = useMap();
    
    useEffect(() => {
        if (map) {
            map.setView(center, 15);
        }
    }, [center, map]);
    
    const mapEvents = useMap({
        click(e) {
             onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });

    return <Marker position={center} />;
}


const InteractiveMap = ({ onLocationSelect, initialPosition }: InteractiveMapProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearchQuery = useDebounce(searchQuery, 500);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [mapCenter, setMapCenter] = useState<[number, number]>(initialPosition);

    useEffect(() => {
        setMapCenter(initialPosition);
    }, [initialPosition]);

    // Fetch autocomplete suggestions using the new SDK
    useEffect(() => {
        if (debouncedSearchQuery.length < 3) {
            setSuggestions([]);
            return;
        }

        const fetchSuggestions = async () => {
            try {
                const result = await barikoi.autocomplete({ q: debouncedSearchQuery });
                if (result.data && result.data.status === 200 && result.data.places) {
                    setSuggestions(result.data.places);
                } else {
                    setSuggestions([]);
                }
            } catch (error) {
                console.error("Barikoi autocomplete error:", error);
                setSuggestions([]);
            }
        };

        fetchSuggestions();
    }, [debouncedSearchQuery]);

    // Fetch address from coordinates using the new SDK
    const fetchAddressFromCoords = async (lat: number, lng: number) => {
        try {
            const result = await barikoi.reverseGeocode({
                longitude: lng,
                latitude: lat,
                district: true,
                post_code: true,
                sub_district: true,
                division: true,
                address: true,
                area: true,
            });

            if (result.data && result.data.status === 200 && result.data.place) {
                onLocationSelect({
                    lat,
                    lng,
                    division: result.data.place.division || '',
                    district: result.data.place.district || '',
                    upazila: result.data.place.sub_district || '',
                    area: result.data.place.area || '',
                    streetAddress: result.data.place.address || ''
                });
            }
        } catch (error) {
            console.error("Barikoi reverse geocode error:", error);
        }
    };
    
    const handleMapClick = (lat: number, lng: number) => {
        setMapCenter([lat, lng]);
        fetchAddressFromCoords(lat, lng);
    };

    const handleSuggestionClick = (place: any) => {
        setSearchQuery('');
        setSuggestions([]);
        const lat = parseFloat(place.latitude);
        const lng = parseFloat(place.longitude);
        setMapCenter([lat, lng]);
        fetchAddressFromCoords(lat, lng);
    };

    const handleCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const { latitude, longitude } = position.coords;
                handleMapClick(latitude, longitude);
            });
        }
    };

    return (
        <div className="flex flex-col gap-4 h-full">
            <div className="relative">
                <div className="flex gap-2">
                    <Input
                        placeholder="Search for a location..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Button type="button" onClick={handleCurrentLocation} variant="outline" size="icon"><LocateFixed size={18} /></Button>
                </div>
                {suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-background border rounded-md shadow-lg z-[9999] max-h-60 overflow-y-auto mt-1">
                        {suggestions.map((place) => (
                            <div
                                key={place.id}
                                className="p-3 hover:bg-muted cursor-pointer"
                                onClick={() => handleSuggestionClick(place)}
                            >
                                <p className="font-semibold text-sm">{place.address}</p>
                                <p className="text-xs text-muted-foreground">{place.area}, {place.city}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="w-full h-full min-h-[300px] rounded-lg overflow-hidden z-0">
                <MapContainer center={initialPosition} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <MapController center={mapCenter} onLocationSelect={handleMapClick} />
                </MapContainer>
            </div>
        </div>
    );
};

export default InteractiveMap;
