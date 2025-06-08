
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, DollarSign, Map, ChevronDown, ChevronUp } from 'lucide-react';
import { TripMap } from '@/components/map/TripMap';

interface Trip {
  id: string;
  title: string;
  destination: string;
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  status: string;
  style: string[] | null;
  created_at: string;
  itinerary?: any;
}

interface TripCardProps {
  trip: Trip;
  onViewDetails?: (trip: Trip) => void;
  onContinuePlanning?: (trip: Trip) => void;
}

export function TripCard({ trip, onViewDetails, onContinuePlanning }: TripCardProps) {
  const [showMap, setShowMap] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNING': return 'bg-blue-100 text-blue-800';
      case 'BOOKED': return 'bg-green-100 text-green-800';
      case 'COMPLETED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'TBD';
    return new Date(date).toLocaleDateString();
  };

  const hasPlaces = trip.itinerary?.places && trip.itinerary.places.length > 0;

  return (
    <Card className="bg-white hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{trip.title}</CardTitle>
            <div className="flex items-center text-gray-600 mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="text-sm">{trip.destination}</span>
            </div>
          </div>
          <Badge className={getStatusColor(trip.status)}>
            {trip.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {/* Trip Details */}
        <div className="grid grid-cols-1 gap-3 text-sm text-gray-600">
          {trip.start_date && (
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              <span>
                {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
              </span>
            </div>
          )}
          {trip.budget && (
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              <span>฿{trip.budget.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Travel Styles */}
        {trip.style && trip.style.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {trip.style.slice(0, 3).map((style) => (
              <Badge key={style} variant="secondary" className="text-xs">
                {style}
              </Badge>
            ))}
            {trip.style.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{trip.style.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Description */}
        {trip.itinerary?.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {trip.itinerary.description}
          </p>
        )}

        {/* Map Toggle Button */}
        {hasPlaces && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMap(!showMap)}
            className="w-full"
          >
            <Map className="h-4 w-4 mr-2" />
            {showMap ? 'Hide Map' : 'Show Map & Places'}
            {showMap ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
          </Button>
        )}

        {/* Map Component */}
        {showMap && hasPlaces && (
          <div className="mt-4">
            <TripMap 
              places={trip.itinerary.places} 
              destination={trip.destination}
            />
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onViewDetails?.(trip)}
            className="flex-1"
          >
            View Details
          </Button>
          <Button 
            size="sm"
            onClick={() => onContinuePlanning?.(trip)}
            className="flex-1"
          >
            Continue Planning
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
