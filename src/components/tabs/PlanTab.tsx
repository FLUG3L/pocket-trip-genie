
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Plus, MapPin } from 'lucide-react';
import { CreateTripForm } from '@/components/trip/CreateTripForm';
import { TripCard } from '@/components/trip/TripCard';

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
  itinerary: any;
}

export function PlanTab() {
  const { user } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { data: trips, isLoading, refetch } = useQuery({
    queryKey: ['trips'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Trip[];
    },
    enabled: !!user,
  });

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    refetch();
  };

  const handleViewDetails = (trip: Trip) => {
    console.log('View details for trip:', trip.id);
    // TODO: Navigate to trip details page
  };

  const handleContinuePlanning = (trip: Trip) => {
    console.log('Continue planning for trip:', trip.id);
    // TODO: Navigate to trip planning page
  };

  if (isLoading) {
    return (
      <div className="p-4 pb-20">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="h-32">
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20 bg-gray-50 min-h-screen">
      {!showCreateForm ? (
        <>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">My Trips</h1>
              <p className="text-gray-600">Plan and manage your adventures</p>
            </div>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Trip
            </Button>
          </div>

          {/* Trips List */}
          <div className="space-y-4">
            {trips?.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onViewDetails={handleViewDetails}
                onContinuePlanning={handleContinuePlanning}
              />
            ))}

            {trips?.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No trips yet</h3>
                  <p className="text-gray-600 mb-4">Start planning your next adventure!</p>
                  <Button onClick={() => setShowCreateForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Trip
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      ) : (
        <div className="max-w-2xl mx-auto pt-8">
          <CreateTripForm
            onSuccess={handleCreateSuccess}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      )}
    </div>
  );
}
