
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Clock, DollarSign } from 'lucide-react';

export function DiscoverTab() {
  const recommendations = [
    {
      id: 1,
      name: 'Elephant Nature Park',
      location: 'Chiang Mai',
      rating: 4.8,
      category: 'Nature',
      priceRange: '฿฿',
      description: 'Ethical elephant sanctuary with morning feeding sessions',
      image: '/placeholder.svg',
      distance: '12 km',
      estimatedTime: '4-6 hours',
    },
    {
      id: 2,
      name: 'Sunday Walking Street',
      location: 'Chiang Mai',
      rating: 4.6,
      category: 'Culture',
      priceRange: '฿',
      description: 'Vibrant night market with local crafts and street food',
      image: '/placeholder.svg',
      distance: '2.5 km',
      estimatedTime: '2-3 hours',
    },
    {
      id: 3,
      name: 'Sticky Waterfall',
      location: 'Chiang Mai',
      rating: 4.7,
      category: 'Adventure',
      priceRange: '฿',
      description: 'Unique limestone waterfall you can climb barefoot',
      image: '/placeholder.svg',
      distance: '45 km',
      estimatedTime: 'Full day',
    },
  ];

  return (
    <div className="space-y-4 pb-20">
      <div className="sticky top-0 bg-white z-10 p-4 border-b">
        <h1 className="text-2xl font-bold text-blue-600">Discover</h1>
        <p className="text-gray-600">AI-curated experiences just for you</p>
      </div>

      {/* Quick Actions */}
      <div className="px-4">
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
            <span className="text-2xl mb-1">⚡</span>
            <span className="text-sm">Spontaneous Trip</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
            <span className="text-2xl mb-1">🎯</span>
            <span className="text-sm">Near Me</span>
          </Button>
        </div>
      </div>

      {/* Filter Badges */}
      <div className="px-4">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {['All', 'Nature', 'Food', 'Culture', 'Adventure', 'Relaxation'].map((filter) => (
            <Badge 
              key={filter} 
              variant={filter === 'All' ? 'default' : 'outline'}
              className="whitespace-nowrap"
            >
              {filter}
            </Badge>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="space-y-4">
        {recommendations.map((place) => (
          <Card key={place.id} className="mx-4">
            <div className="w-full h-48 bg-gray-100 rounded-t-lg flex items-center justify-center">
              <span className="text-gray-400">📸 {place.name}</span>
            </div>
            
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-lg">{place.name}</h3>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="text-sm">{place.rating}</span>
                </div>
              </div>
              
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <MapPin className="h-4 w-4 mr-1" />
                {place.location} • {place.distance}
              </div>
              
              <p className="text-sm text-gray-700 mb-3">{place.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{place.category}</Badge>
                  <span className="text-sm font-medium">{place.priceRange}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-1" />
                  {place.estimatedTime}
                </div>
              </div>
              
              <Button className="w-full mt-3">
                Add to Trip
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
