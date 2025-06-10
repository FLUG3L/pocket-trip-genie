import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { message, userId, action, n8nWebhookUrl, n8nResponse } = await req.json();

    console.log('AI Chat request:', { message, userId, action, n8nWebhookUrl, hasN8nResponse: !!n8nResponse });

    // Get user authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Ensure user exists in database
    await ensureUserExists(supabase, userId);

    // If this is a response FROM n8n, just return it
    if (n8nResponse) {
      return new Response(JSON.stringify({
        response: n8nResponse,
        action: 'n8n_response'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // If n8n webhook URL is provided, try to get response from n8n first
    if (n8nWebhookUrl && message) {
      try {
        const n8nResponse = await sendToN8nAndWaitForResponse(n8nWebhookUrl, {
          timestamp: new Date().toISOString(),
          user_id: userId,
          user_email: (await supabase.auth.admin.getUserById(userId)).data?.user?.email,
          event_type: 'user_message',
          message: message,
          action: action || 'chat'
        });

        if (n8nResponse && n8nResponse.response) {
          return new Response(JSON.stringify({
            response: n8nResponse.response,
            action: 'n8n_response',
            trip: n8nResponse.trip
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      } catch (error) {
        console.error('n8n request failed, falling back to built-in AI:', error);
      }
    }

    // If creating a trip, try to create from template
    if (action === 'create_trip') {
      try {
        const destination = extractDestination(message) || 'Bangkok';
        const duration = extractDuration(message) || 3;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + 7);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + duration);

        const tripData = {
          title: `Trip to ${destination}`,
          destination: destination,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          budget: extractBudget(message) || 15000,
          style: ['Adventure', 'Cultural'],
          user_id: userId,
          status: 'PLANNING',
          itinerary: {
            description: `Explore the amazing ${destination} with this ${duration}-day adventure.`,
            places: generatePlacesForDestination(destination)
          }
        };

        const { data: trip, error: tripError } = await supabase
          .from('trips')
          .insert(tripData)
          .select()
          .single();

        if (tripError) {
          console.error('Trip creation error:', tripError);
          throw tripError;
        }

        return new Response(JSON.stringify({
          response: `Perfect! I've created "${tripData.title}" for you! Your ${duration}-day adventure to ${destination} is ready with amazing places to visit and a budget of ฿${tripData.budget}. Check out the map and places I've selected for you!`,
          trip: trip,
          action: 'trip_created'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error('Error creating trip:', error);
        return new Response(JSON.stringify({
          response: "I'd love to help you plan a trip! Could you tell me more details like your destination, how many days, and your budget? For example: 'Create a trip to Chiang Mai for 4 days with 8000 baht budget'",
          action: 'error'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // For regular chat, provide varied responses
    const response = generateVariedTravelResponse(message);

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

async function sendToN8nAndWaitForResponse(webhookUrl: string, data: any) {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`n8n webhook responded with status: ${response.status}`);
    }

    const result = await response.json();
    console.log('n8n response received:', result);
    return result;
  } catch (error) {
    console.error('Error calling n8n webhook:', error);
    throw error;
  }
}

async function ensureUserExists(supabase: any, userId: string) {
  try {
    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (!existingUser) {
      // Get user info from auth
      const { data: authUser } = await supabase.auth.admin.getUserById(userId);
      
      if (authUser?.user) {
        // Create user record
        await supabase
          .from('users')
          .insert({
            id: userId,
            email: authUser.user.email,
            full_name: authUser.user.user_metadata?.full_name || 'Travel Explorer',
            preferences: { onboardingCompleted: true }
          });
        console.log('Created user record for:', userId);
      }
    }
  } catch (error) {
    console.error('Error ensuring user exists:', error);
  }
}

function extractDestination(message: string): string | null {
  const destinations = [
    'Chiang Mai', 'Bangkok', 'Phuket', 'Pattaya', 'Krabi', 'Koh Samui', 'Ayutthaya',
    'Tokyo', 'Paris', 'London', 'New York', 'Seoul', 'Singapore', 'Dubai', 'Rome', 'Barcelona'
  ];
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

function extractBudget(message: string): number {
  const match = message.match(/(\d+)\s*(baht|bath|฿|dollars?|\$)/i);
  if (match) {
    const amount = parseInt(match[1]);
    const currency = match[2].toLowerCase();
    if (currency.includes('dollar') || currency.includes('$')) {
      return amount * 35; // Convert USD to THB roughly
    }
    return amount;
  }
  return 15000;
}

function generatePlacesForDestination(destination: string) {
  const placeTemplates: { [key: string]: any[] } = {
    'Chiang Mai': [
      {
        name: 'Wat Phra That Doi Suthep',
        description: 'Sacred temple with stunning city views and golden pagoda',
        lat: 18.8048, lng: 98.9216,
        price_range: '$', category: 'Temple'
      },
      {
        name: 'Chiang Mai Night Bazaar',
        description: 'Vibrant night market with local crafts, food, and souvenirs',
        lat: 18.7883, lng: 98.9939,
        price_range: '$$', category: 'Shopping'
      },
      {
        name: 'Khao Soi Mae Sai',
        description: 'Famous local restaurant serving authentic Khao Soi noodles',
        lat: 18.7967, lng: 98.9664,
        price_range: '$', category: 'Restaurant'
      }
    ],
    'Bangkok': [
      {
        name: 'Grand Palace',
        description: 'Magnificent royal palace complex with intricate Thai architecture',
        lat: 13.7500, lng: 100.4916,
        price_range: '$$', category: 'Palace'
      },
      {
        name: 'Chatuchak Weekend Market',
        description: 'Massive market with over 15,000 stalls selling everything imaginable',
        lat: 13.7998, lng: 100.5490,
        price_range: '$', category: 'Market'
      },
      {
        name: 'Wat Arun',
        description: 'Iconic temple of dawn with towering spires along the Chao Phraya River',
        lat: 13.7437, lng: 100.4883,
        price_range: '$', category: 'Temple'
      }
    ]
  };

  return placeTemplates[destination] || [
    {
      name: `${destination} City Center`,
      description: `Explore the heart of ${destination}`,
      lat: getCoordinates(destination).lat,
      lng: getCoordinates(destination).lng,
      price_range: "$$",
      category: "Sightseeing"
    }
  ];
}

function getCoordinates(destination: string) {
  const coords: { [key: string]: { lat: number, lng: number } } = {
    'Chiang Mai': { lat: 18.7883, lng: 98.9853 },
    'Bangkok': { lat: 13.7563, lng: 100.5018 },
    'Phuket': { lat: 7.8804, lng: 98.3923 },
    'Tokyo': { lat: 35.6762, lng: 139.6503 },
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

function generateVariedTravelResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  const responses = [
    {
      keywords: ['chiang mai'],
      responses: [
        "Chiang Mai is absolutely magical! 🏛️ Known for its ancient temples, vibrant night markets, and delicious Khao Soi noodles. The best time to visit is during cool season (Nov-Feb). Don't miss Doi Suthep temple and the Sunday Walking Street!",
        "Chiang Mai is perfect for culture lovers! 🌸 You'll love the old city temples, elephant sanctuaries, and cooking classes. Try the famous Khao Soi and visit during Yi Peng lantern festival if possible!"
      ]
    },
    {
      keywords: ['bangkok'],
      responses: [
        "Bangkok is an incredible city! 🏙️ Mix of ancient temples like Wat Pho and modern shopping malls. Must-try: street food at Chatuchak Market, boat ride along Chao Phraya River, and visiting the Grand Palace!",
        "Bangkok never sleeps! ✨ From the golden temples to rooftop bars, floating markets to street food paradise. The BTS Skytrain makes getting around super easy. Budget around 1,500-3,000 baht per day."
      ]
    },
    {
      keywords: ['budget', 'cost', 'price', 'money'],
      responses: [
        "Thailand is very budget-friendly! 💰 For backpackers: 1,000-1,500 baht/day. Mid-range: 2,500-4,000 baht/day. Luxury: 5,000+ baht/day. Street food costs 40-80 baht, while restaurant meals are 150-400 baht.",
        "Your budget depends on your style! 🏦 Hostels: 300-600 baht/night. Hotels: 1,200-3,000 baht/night. Meals: Street food 50 baht, restaurants 200-500 baht. Transportation is very cheap!"
      ]
    },
    {
      keywords: ['where', 'destination', 'place'],
      responses: [
        "Thailand has amazing destinations! 🗺️ Beach lovers: Phuket, Koh Samui, Krabi. Culture seekers: Bangkok, Chiang Mai, Ayutthaya. Adventure: Pai, Kanchanaburi. Each offers unique experiences!",
        "So many incredible places to choose from! 🌴 Islands: Phi Phi, Koh Tao for diving. Mountains: Chiang Rai, Mae Hong Son. History: Sukhothai, Lopburi. What type of experience are you looking for?"
      ]
    },
    {
      keywords: ['food', 'eat', 'restaurant'],
      responses: [
        "Thai food is incredible! 🍜 Must-try: Pad Thai, Tom Yum, Green Curry, Mango Sticky Rice, Som Tam. Street food is safe and delicious - look for busy stalls with locals eating there!",
        "Foodie paradise awaits! 🥘 From 40-baht Pad Thai on the street to Michelin-starred restaurants. Don't miss: Khao Soi in Chiang Mai, boat noodles in Bangkok, fresh seafood in coastal areas!"
      ]
    }
  ];

  // Find matching response
  for (const category of responses) {
    if (category.keywords.some(keyword => lowerMessage.includes(keyword))) {
      const randomResponse = category.responses[Math.floor(Math.random() * category.responses.length)];
      return randomResponse;
    }
  }

  // Default responses
  const defaultResponses = [
    "I'm your travel assistant! ✈️ I can help you plan trips, suggest destinations, and answer travel questions. Try asking me to create a trip or ask about specific places in Thailand!",
    "Ready for your next adventure? 🌟 I can help with trip planning, destination advice, budget tips, and local recommendations. What would you like to know about travel?",
    "Let's explore the world together! 🗺️ I specialize in travel planning and can create custom itineraries. Ask me about destinations, budgets, or say 'create a trip to [destination]'!",
    "Travel planning made easy! 🎒 I can help you discover amazing places, plan your itinerary, and give travel tips. What's your dream destination?"
  ];

  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}
