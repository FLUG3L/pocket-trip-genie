
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const googleApiKey = Deno.env.get('GOOGLE_API_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { message, userId, action } = await req.json();

    console.log('AI Chat request:', { message, userId, action });

    // Get user authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // If creating a trip, try to create from template
    if (action === 'create_trip') {
      try {
        // Create a basic trip based on the message
        const destination = extractDestination(message) || 'Bangkok';
        const duration = extractDuration(message) || 3;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + 7); // Start next week
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + duration);

        const tripData = {
          title: `Trip to ${destination}`,
          destination: destination,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          budget: 15000,
          style: ['Adventure', 'Cultural'],
          user_id: userId,
          status: 'PLANNING',
          itinerary: {
            description: `Explore the amazing ${destination} with this ${duration}-day adventure.`,
            places: [
              {
                name: `${destination} City Center`,
                description: `Explore the heart of ${destination}`,
                lat: getCoordinates(destination).lat,
                lng: getCoordinates(destination).lng,
                price_range: "$$",
                category: "Sightseeing"
              },
              {
                name: `Local Restaurant in ${destination}`,
                description: `Try authentic local cuisine`,
                lat: getCoordinates(destination).lat + 0.01,
                lng: getCoordinates(destination).lng + 0.01,
                price_range: "$$$",
                category: "Restaurant"
              }
            ]
          }
        };

        const { data: trip, error: tripError } = await supabase
          .from('trips')
          .insert(tripData)
          .select()
          .single();

        if (tripError) throw tripError;

        return new Response(JSON.stringify({
          response: `Trip "${tripData.title}" created successfully! I've planned your ${duration}-day trip to ${destination}.`,
          trip: trip,
          action: 'trip_created'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error('Error creating trip:', error);
        return new Response(JSON.stringify({
          response: "I can help you plan a trip! Please provide more details like destination, dates, and budget.",
          action: 'error'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // For regular chat, provide helpful responses
    const response = generateTravelResponse(message);

    return new Response(JSON.stringify({
      response: response,
      action: 'chat'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(JSON.stringify({
      error: 'Failed to process request',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function extractDestination(message: string): string | null {
  const destinations = ['Tokyo', 'Bangkok', 'Paris', 'London', 'New York', 'Seoul', 'Singapore', 'Dubai', 'Rome', 'Barcelona'];
  for (const dest of destinations) {
    if (message.toLowerCase().includes(dest.toLowerCase())) {
      return dest;
    }
  }
  return null;
}

function extractDuration(message: string): number {
  const match = message.match(/(\d+)\s*(day|days)/i);
  return match ? parseInt(match[1]) : 3;
}

function getCoordinates(destination: string) {
  const coords: { [key: string]: { lat: number, lng: number } } = {
    'Tokyo': { lat: 35.6762, lng: 139.6503 },
    'Bangkok': { lat: 13.7563, lng: 100.5018 },
    'Paris': { lat: 48.8566, lng: 2.3522 },
    'London': { lat: 51.5074, lng: -0.1278 },
    'New York': { lat: 40.7128, lng: -74.0060 },
    'Seoul': { lat: 37.5665, lng: 126.9780 },
    'Singapore': { lat: 1.3521, lng: 103.8198 },
    'Dubai': { lat: 25.2048, lng: 55.2708 },
    'Rome': { lat: 41.9028, lng: 12.4964 },
    'Barcelona': { lat: 41.3851, lng: 2.1734 }
  };
  return coords[destination] || { lat: 13.7563, lng: 100.5018 };
}

function generateTravelResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('where') || lowerMessage.includes('destination')) {
    return "I can help you discover amazing destinations! Some popular options include Tokyo for culture and technology, Bangkok for delicious food and temples, or Paris for art and romance. What type of experience are you looking for?";
  }
  
  if (lowerMessage.includes('budget') || lowerMessage.includes('cost')) {
    return "Travel budgets vary greatly depending on destination and style. For Southeast Asia, $30-50/day is reasonable. For Europe, budget $80-120/day. For luxury travel, expect $200+/day. What's your target budget range?";
  }
  
  if (lowerMessage.includes('when') || lowerMessage.includes('time')) {
    return "The best time to travel depends on your destination and preferences. Generally, shoulder seasons (spring/fall) offer good weather and fewer crowds. What destination are you considering?";
  }
  
  if (lowerMessage.includes('create') || lowerMessage.includes('plan') || lowerMessage.includes('trip')) {
    return "I'd love to help you create a trip! Just tell me something like 'Create a trip to Tokyo for 5 days' and I'll plan an itinerary for you with places to visit and a budget estimate.";
  }
  
  return "I'm your travel assistant! I can help you plan trips, suggest destinations, estimate budgets, and answer travel questions. Try asking me to create a trip or ask about travel destinations!";
}
