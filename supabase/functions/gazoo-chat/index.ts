// Supabase Edge Function for Gazoo AI Chat
// This keeps your OpenAI API key secure on the server side

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the OpenAI API key from environment variables (set in Supabase dashboard)
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured in Edge Function')
    }

    // Parse request body
    const { messages, conversationId } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: messages array required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are Gazoo AI, an intelligent student companion for Student Konnect app.

You help students with:
- Study techniques and time management
- Budgeting and financial advice
- Career guidance and internship tips
- Mental wellness and stress management
- Academic support and course selection
- Campus life and social connections

Be friendly, encouraging, and provide practical, actionable advice.
Keep responses concise but comprehensive (2-4 paragraphs).
Use emojis sparingly to add warmth.
Remember context from previous messages in the conversation.
Tailor advice to South African university students.`
          },
          ...messages
        ],
        temperature: 0.8,
        max_tokens: 800,
        presence_penalty: 0.6,
        frequency_penalty: 0.5,
      }),
    })

    if (!openaiResponse.ok) {
      const error = await openaiResponse.json()
      console.error('OpenAI API error:', error)
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`)
    }

    const data = await openaiResponse.json()
    const assistantMessage = data.choices[0]?.message?.content

    if (!assistantMessage) {
      throw new Error('No response from OpenAI')
    }

    // Get user from authorization header
    const authHeader = req.headers.get('Authorization')
    if (authHeader) {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        {
          global: {
            headers: { Authorization: authHeader },
          },
        }
      )

      // Get current user
      const { data: { user } } = await supabaseClient.auth.getUser()

      // Save conversation to database if conversationId provided
      if (user && conversationId) {
        // Update the conversation with new messages
        const { error: updateError } = await supabaseClient
          .from('gazoo_conversations')
          .update({
            messages: messages.concat([
              { role: 'assistant', content: assistantMessage }
            ]),
            updated_at: new Date().toISOString(),
          })
          .eq('id', conversationId)
          .eq('user_id', user.id)

        if (updateError) {
          console.error('Error updating conversation:', updateError)
        }
      }
    }

    // Return the assistant's response
    return new Response(
      JSON.stringify({ 
        message: assistantMessage,
        success: true 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in gazoo-chat function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        success: false 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
