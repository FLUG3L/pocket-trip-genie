
import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, DollarSign } from 'lucide-react';

interface Place {
  name: string;
  description: string;
  lat: number;
  lng: number;
  price_range: string;
  category: string;
}

interface TripMapProps {
  places: Place[];
  destination: string;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export function TripMap({ places, destination }: TripMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google) {
        initializeMap();
        return;
      }

      window.initMap = initializeMap;
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAS7QiACN7fGN665Vpw12rgaNU9BcwWe_E&callback=initMap`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    };

    const initializeMap = () => {
      if (!mapRef.current || !window.google) return;

      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 12,
        center: places.length > 0 ? { lat: places[0].lat, lng: places[0].lng } : { lat: 13.7563, lng: 100.5018 },
      });

      // Add markers for each place
      places.forEach((place, index) => {
        const marker = new window.google.maps.Marker({
          position: { lat: place.lat, lng: place.lng },
          map: map,
          title: place.name,
          label: (index + 1).toString(),
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="max-width: 200px;">
              <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">${place.name}</h3>
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">${place.description}</p>
              <div style="display: flex; gap: 8px; align-items: center;">
                <span style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 11px;">${place.category}</span>
                <span style="font-size: 12px; color: #16a34a; font-weight: bold;">${place.price_range}</span>
              </div>
            </div>
          `,
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
          setSelectedPlace(place);
        });
      });

      // Create route if there are multiple places
      if (places.length > 1) {
        const directionsService = new window.google.maps.DirectionsService();
        const directionsRenderer = new window.google.maps.DirectionsRenderer({
          suppressMarkers: true, // We'll use our custom markers
        });
        directionsRenderer.setMap(map);

        const waypoints = places.slice(1, -1).map(place => ({
          location: { lat: place.lat, lng: place.lng },
          stopover: true,
        }));

        directionsService.route({
          origin: { lat: places[0].lat, lng: places[0].lng },
          destination: { lat: places[places.length - 1].lat, lng: places[places.length - 1].lng },
          waypoints: waypoints,
          travelMode: window.google.maps.TravelMode.DRIVING,
        }, (result: any, status: any) => {
          if (status === 'OK') {
            directionsRenderer.setDirections(result);
          }
        });
      }

      setIsLoaded(true);
    };

    loadGoogleMaps();
  }, [places]);

  const getPriceColor = (priceRange: string) => {
    switch (priceRange) {
      case '$': return 'bg-green-100 text-green-800';
      case '$$': return 'bg-yellow-100 text-yellow-800';
      case '$$$': return 'bg-orange-100 text-orange-800';
      case '$$$$': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            Trip Route - {destination}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div ref={mapRef} className="w-full h-64 rounded-lg" />
          {!isLoaded && (
            <div className="w-full h-64 rounded-lg bg-gray-100 flex items-center justify-center">
              <div className="text-gray-500">Loading map...</div>
            </div>
          )}
        </CardContent>
      </Card>

      {places.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Places to Visit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {places.map((place, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedPlace === place ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedPlace(place)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {index + 1}
                        </span>
                        <h4 className="font-medium text-sm">{place.name}</h4>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{place.description}</p>
                      <div className="flex gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {place.category}
                        </Badge>
                        <Badge className={`text-xs ${getPriceColor(place.price_range)}`}>
                          <DollarSign className="h-3 w-3 mr-1" />
                          {place.price_range}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
