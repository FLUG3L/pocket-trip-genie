
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plane, Hotel, Car, Calendar, Clock, CheckCircle } from 'lucide-react';

export function BookingsTab() {
  const bookings = [
    {
      id: 1,
      type: 'flight',
      title: 'Bangkok to Chiang Mai',
      provider: 'Thai Airways',
      date: 'Dec 15, 2024',
      time: '14:30 - 16:00',
      status: 'confirmed',
      amount: 2850,
      reference: 'TG123456',
    },
    {
      id: 2,
      type: 'hotel',
      title: 'Riverside Boutique Hotel',
      provider: 'Agoda',
      date: 'Dec 15-17, 2024',
      time: 'Check-in: 15:00',
      status: 'confirmed',
      amount: 4200,
      reference: 'AG789012',
    },
    {
      id: 3,
      type: 'activity',
      title: 'Elephant Nature Park Tour',
      provider: 'GetYourGuide',
      date: 'Dec 16, 2024',
      time: '08:00 - 17:00',
      status: 'pending',
      amount: 1650,
      reference: 'GYG345678',
    },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'flight': return <Plane className="h-5 w-5" />;
      case 'hotel': return <Hotel className="h-5 w-5" />;
      case 'activity': return <Calendar className="h-5 w-5" />;
      default: return <Car className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'pending': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-4 pb-20">
      <div className="sticky top-0 bg-white z-10 p-4 border-b">
        <h1 className="text-2xl font-bold text-blue-600">Bookings</h1>
        <p className="text-gray-600">Manage your travel reservations</p>
      </div>

      {/* Quick Booking Actions */}
      <div className="px-4">
        <div className="grid grid-cols-4 gap-3">
          <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
            <Plane className="h-6 w-6 mb-1" />
            <span className="text-xs">Flights</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
            <Hotel className="h-6 w-6 mb-1" />
            <span className="text-xs">Hotels</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
            <Car className="h-6 w-6 mb-1" />
            <span className="text-xs">Transport</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
            <Calendar className="h-6 w-6 mb-1" />
            <span className="text-xs">Activities</span>
          </Button>
        </div>
      </div>

      {/* Bookings List */}
      <div className="px-4">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-3 mt-4">
            {bookings.map((booking) => (
              <Card key={booking.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        {getIcon(booking.type)}
                      </div>
                      <div>
                        <h4 className="font-semibold">{booking.title}</h4>
                        <p className="text-sm text-gray-600">{booking.provider}</p>
                      </div>
                    </div>
                    <Badge variant={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                      {booking.date}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-gray-500" />
                      {booking.time}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div>
                      <p className="text-sm text-gray-600">Total</p>
                      <p className="font-semibold">฿{booking.amount.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Ref: {booking.reference}</p>
                      <Button variant="outline" size="sm" className="mt-1">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          
          <TabsContent value="upcoming">
            <p className="text-center text-gray-600 py-8">Upcoming bookings will appear here</p>
          </TabsContent>
          
          <TabsContent value="past">
            <p className="text-center text-gray-600 py-8">Past bookings will appear here</p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
