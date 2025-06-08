
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

    // Call Gemini API
    const prompt = action === 'create_trip' 
      ? `You are a travel planning assistant. Based on this request: "${message}", create a detailed trip plan. Return ONLY a JSON object with this exact structure:
{
  "title": "Trip title",
  "destination": "Main destination",
  "description": "Brief description",
  "start_date": "YYYY-MM-DD",
  "end_date": "YYYY-MM-DD", 
  "budget": 5000,
  "style": ["Adventure", "Cultural"],
  "places": [
    {
      "name": "Place name",
      "description": "Description",
      "lat": 13.7563,
      "lng": 100.5018,
      "price_range": "$$",
      "category": "Restaurant"
    }
  ]
}`
      : `You are a helpful travel assistant. Answer this question about travel: "${message}". Be concise and helpful.`;

    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${googleApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      }),
    });

    const geminiData = await geminiResponse.json();
    const aiResponse = geminiData.candidates[0].content.parts[0].text;

    console.log('Gemini response:', aiResponse);

    // If creating a trip, parse the response and save to database
    if (action === 'create_trip') {
      try {
        const tripData = JSON.parse(aiResponse);
        
        // Create trip in database
        const { data: trip, error: tripError } = await supabase
          .from('trips')
          .insert({
            title: tripData.title,
            destination: tripData.destination,
            start_date: tripData.start_date,
            end_date: tripData.end_date,
            budget: tripData.budget,
            style: tripData.style,
            user_id: userId,
            status: 'PLANNING',
            itinerary: {
              description: tripData.description,
              places: tripData.places || []
            }
          })
          .select()
          .single();

        if (tripError) throw tripError;

        return new Response(JSON.stringify({
          response: `Trip "${tripData.title}" created successfully! I've planned your trip to ${tripData.destination}.`,
          trip: trip,
          action: 'trip_created'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (parseError) {
        console.error('Error parsing trip data:', parseError);
        return new Response(JSON.stringify({
          response: "I can help you plan a trip! Please provide more details like destination, dates, and budget.",
          action: 'error'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(JSON.stringify({
      response: aiResponse,
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
