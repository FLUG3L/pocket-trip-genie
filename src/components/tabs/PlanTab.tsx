
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, MapPin, Users, DollarSign } from 'lucide-react';

export function PlanTab() {
  const [trips] = useState([
    {
      id: 1,
      title: 'Weekend in Chiang Mai',
      destination: 'Chiang Mai, Thailand',
      dates: 'Dec 15-17, 2024',
      status: 'Planning',
      budget: 5000,
      collaborators: 2,
      progress: 60,
    },
    {
      id: 2,
      title: 'Bangkok Food Tour',
      destination: 'Bangkok, Thailand',
      dates: 'Jan 20-22, 2025',
      status: 'Draft',
      budget: 3000,
      collaborators: 1,
      progress: 20,
    },
  ]);

  return (
    <div className="space-y-4 pb-20">
      <div className="sticky top-0 bg-white z-10 p-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">Plan</h1>
            <p className="text-gray-600">Create and manage your trips</p>
          </div>
          <Button className="flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            New Trip
          </Button>
        </div>
      </div>

      {/* AI Trip Planner */}
      <div className="px-4">
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-2">🤖 AI Trip Planner</h3>
            <p className="mb-4 opacity-90">Let AI create the perfect itinerary based on your preferences</p>
            <Button variant="secondary" className="w-full">
              Create AI Trip
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Templates */}
      <div className="px-4">
        <h3 className="font-semibold mb-3">Quick Templates</h3>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
            <span className="text-2xl mb-1">🏖️</span>
            <span className="text-sm">Weekend Getaway</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
            <span className="text-2xl mb-1">🍜</span>
            <span className="text-sm">Food Tour</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
            <span className="text-2xl mb-1">🏔️</span>
            <span className="text-sm">Adventure Trip</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
            <span className="text-2xl mb-1">🏛️</span>
            <span className="text-sm">Cultural Tour</span>
          </Button>
        </div>
      </div>

      {/* Your Trips */}
      <div className="px-4">
        <h3 className="font-semibold mb-3">Your Trips</h3>
        <div className="space-y-3">
          {trips.map((trip) => (
            <Card key={trip.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{trip.title}</h4>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      {trip.destination}
                    </div>
                  </div>
                  <Badge variant={trip.status === 'Planning' ? 'default' : 'secondary'}>
                    {trip.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                    {trip.dates}
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-1 text-gray-500" />
                    ฿{trip.budget.toLocaleString()}
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1 text-gray-500" />
                    {trip.collaborators} people
                  </div>
                </div>
                
                <div className="mt-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{trip.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${trip.progress}%` }}
                    ></div>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full mt-3">
                  Continue Planning
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
