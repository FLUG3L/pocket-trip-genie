
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

    // If n8n webhook URL is provided, ONLY use n8n - no fallback
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

        console.log('Final n8n response:', n8nResponse);

        // Return whatever n8n sends back
        if (n8nResponse && n8nResponse.response) {
          return new Response(JSON.stringify({
            response: n8nResponse.response,
            action: 'n8n_response',
            trip: n8nResponse.trip
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else {
          // If no proper response from n8n, return error
          return new Response(JSON.stringify({
            response: "Sorry, I'm having trouble connecting to my AI service. Please try again later.",
            action: 'error'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      } catch (error) {
        console.error('n8n request failed:', error);
        return new Response(JSON.stringify({
          response: "Sorry, I'm currently unavailable. Please try again later.",
          action: 'error'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // If no n8n webhook URL provided, return error message
    return new Response(JSON.stringify({
      response: "Please configure n8n webhook URL in settings to use AI chat.",
      action: 'error'
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
    console.log('Sending to n8n:', { webhookUrl, data });
    
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
    console.log('Raw n8n response:', result);
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
