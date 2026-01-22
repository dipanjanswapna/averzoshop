"use client"

import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Input } from './input';
import { Button } from './button';
import { Search, LocateFixed } from 'lucide-react';

// Fix for default icon issue with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png').default,
  iconUrl: require('leaflet/dist/images/marker-icon.png').default,
  shadowUrl: require('leaflet/dist/images/marker-shadow.png').default,
});


// This component will contain all the logic that interacts with the map instance
function MapEventsController({ center, onLocationSelect }: { center: [number, number], onLocationSelect: (lat: number, lng: number) => void }) {
    const map = useMap();
    
    // Update map view when center prop changes
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    
    // Handle map clicks
    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });

    return <Marker position={center} />;
}


const InteractiveMap = ({ onLocationSelect, initialPosition }: { onLocationSelect: (lat: number, lng: number) => void, initialPosition: [number, number] }) => {
    const [mapCenter, setMapCenter] = useState<[number, number]>(initialPosition);
    const [searchQuery, setSearchQuery] = useState('');
    
    useEffect(() => {
        onLocationSelect(mapCenter[0], mapCenter[1]);
    }, [mapCenter, onLocationSelect]);

    const handleSearch = async () => {
        if (!searchQuery) return;
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
            const data = await response.json();
            if (data.length > 0) {
                const { lat, lon } = data[0];
                setMapCenter([parseFloat(lat), parseFloat(lon)]);
            } else {
                alert("Location not found");
            }
        } catch (error) {
            console.error("Geocoding API error:", error);
            alert("Failed to search for location.");
        }
    };
    
    const handleCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const { latitude, longitude } = position.coords;
                setMapCenter([latitude, longitude]);
            });
        } else {
            alert('Geolocation is not supported by this browser.');
        }
    };
    
    return (
        <div className="flex flex-col gap-4 h-full">
            <div className="flex gap-2">
                <Input
                    placeholder="Search for a location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearch(); } }}
                />
                <Button type="button" onClick={handleSearch}><Search size={18} /></Button>
                <Button type="button" onClick={handleCurrentLocation} variant="outline"><LocateFixed size={18} /></Button>
            </div>
            <div className="w-full h-full min-h-[300px] rounded-lg overflow-hidden z-0">
                <MapContainer center={initialPosition} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <MapEventsController center={mapCenter} onLocationSelect={(lat, lng) => setMapCenter([lat, lng])} />
                </MapContainer>
            </div>
        </div>
    );
};

export default InteractiveMap;
