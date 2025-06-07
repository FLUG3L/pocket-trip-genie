
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Star, Heart, Clock } from 'lucide-react';

const FEATURED_DESTINATIONS = [
  {
    id: 1,
    name: 'Chiang Mai',
    description: 'Cultural temples and mountain adventures',
    image: '🏔️',
    rating: 4.8,
    category: 'Culture',
    budget: '฿1,500',
    duration: '3-4 days'
  },
  {
    id: 2,
    name: 'Koh Phi Phi',
    description: 'Crystal clear waters and beach life',
    image: '🏝️',
    rating: 4.6,
    category: 'Beach',
    budget: '฿2,000',
    duration: '2-3 days'
  },
  {
    id: 3,
    name: 'Bangkok',
    description: 'Street food and urban exploration',
    image: '🏙️',
    rating: 4.7,
    category: 'City',
    budget: '฿1,200',
    duration: '4-5 days'
  },
  {
    id: 4,
    name: 'Pai',
    description: 'Mountain views and artistic vibes',
    image: '🎨',
    rating: 4.5,
    category: 'Nature',
    budget: '฿800',
    duration: '2-3 days'
  }
];

const TRAVEL_CATEGORIES = [
  { id: 'all', label: 'All', emoji: '🌍' },
  { id: 'nature', label: 'Nature', emoji: '🏔️' },
  { id: 'culture', label: 'Culture', emoji: '🏛️' },
  { id: 'beach', label: 'Beach', emoji: '🏖️' },
  { id: 'city', label: 'City', emoji: '🏙️' },
  { id: 'food', label: 'Food', emoji: '🍜' },
];

export function DiscoverTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredDestinations = FEATURED_DESTINATIONS.filter(destination => {
    const matchesSearch = destination.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         destination.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           destination.category.toLowerCase() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-4 pb-20 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Discover</h1>
        <p className="text-gray-600">Find your next adventure</p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <Input
          placeholder="Search destinations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Categories */}
      <div className="flex overflow-x-auto gap-2 mb-6 pb-2">
        {TRAVEL_CATEGORIES.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            className="whitespace-nowrap flex items-center gap-2"
            onClick={() => setSelectedCategory(category.id)}
          >
            <span>{category.emoji}</span>
            {category.label}
          </Button>
        ))}
      </div>

      {/* Destinations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDestinations.map((destination) => (
          <Card key={destination.id} className="bg-white overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">{destination.image}</div>
                  <div>
                    <CardTitle className="text-lg">{destination.name}</CardTitle>
                    <p className="text-sm text-gray-600">{destination.description}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">{destination.rating}</span>
                </div>
                <Badge variant="secondary">{destination.category}</Badge>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{destination.budget}/day</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{destination.duration}</span>
                </div>
              </div>
              
              <Button className="w-full" size="sm">
                Plan Trip
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDestinations.length === 0 && (
        <Card className="text-center py-8">
          <CardContent>
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No destinations found</h3>
            <p className="text-gray-600">Try adjusting your search or category filter.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
