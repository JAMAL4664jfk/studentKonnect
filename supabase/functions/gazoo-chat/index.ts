// Supabase Edge Function for Gazoo AI Chat
// Uses Gemini 2.5 Flash (OpenAI-compatible) as primary, OpenAI as fallback

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `You are Gazoo AI, an intelligent student companion for the Student Konnect app — a global student platform used by university students worldwide.

You help students with:
- Study techniques and time management
- Budgeting and financial advice for students
- Career guidance and internship tips
- Mental wellness and stress management
- Academic support and course selection
- Campus life and social connections

Be friendly, encouraging, and provide practical, actionable advice.
Keep responses concise but comprehensive (2-4 paragraphs).
Use emojis sparingly to add warmth.
Remember context from previous messages in the conversation.
Tailor advice to university students globally.`

async function callGemini(messages: any[]): Promise<string> {
  // Gemini 2.5 Flash via OpenAI-compatible endpoint
  const geminiApiKey = Deno.env.get('GEMINI_API_KEY') || Deno.env.get('OPENAI_API_KEY')
  if (!geminiApiKey) throw new Error('No AI API key configured')

  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${geminiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gemini-2.5-flash',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      temperature: 0.8,
      max_tokens: 800,
    }),
  })

  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error?.message || `Gemini error: ${response.status}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('Empty response from Gemini')
  return content
}

async function callOpenAI(messages: any[]): Promise<string> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
  if (!openaiApiKey) throw new Error('OpenAI API key not configured')

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      temperature: 0.8,
      max_tokens: 800,
      presence_penalty: 0.6,
      frequency_penalty: 0.5,
    }),
  })

  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error?.message || `OpenAI error: ${response.status}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('Empty response from OpenAI')
  return content
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse request body
    const { messages, conversationId } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: messages array required', success: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Received request with', messages.length, 'messages')

    // Try Gemini first, fall back to OpenAI
    let assistantMessage: string
    let provider = 'gemini'

    try {
      assistantMessage = await callGemini(messages)
      console.log('Successfully got response from Gemini')
    } catch (geminiError: any) {
      console.warn('Gemini failed, trying OpenAI fallback:', geminiError.message)
      provider = 'openai'
      try {
        assistantMessage = await callOpenAI(messages)
        console.log('Successfully got response from OpenAI fallback')
      } catch (openaiError: any) {
        console.error('Both AI providers failed:', openaiError.message)
        return new Response(
          JSON.stringify({
            error: `AI service unavailable. Please try again later. (${openaiError.message})`,
            success: false,
          }),
          { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Try to save conversation to database (optional, won't fail if auth is invalid)
    try {
      const authHeader = req.headers.get('Authorization')
      if (authHeader) {
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_ANON_KEY') ?? '',
          { global: { headers: { Authorization: authHeader } } }
        )

        const { data: { user }, error: userError } = await supabaseClient.auth.getUser()

        if (!userError && user && conversationId) {
          const { error: updateError } = await supabaseClient
            .from('gazoo_conversations')
            .update({
              messages: messages.concat([{ role: 'assistant', content: assistantMessage }]),
              updated_at: new Date().toISOString(),
            })
            .eq('id', conversationId)
            .eq('user_id', user.id)

          if (updateError) {
            console.warn('Error updating conversation (non-fatal):', updateError)
          } else {
            console.log('Successfully saved conversation')
          }
        }
      }
    } catch (dbError) {
      console.warn('Database save failed (non-fatal):', dbError)
    }

    // Return the assistant's response
    return new Response(
      JSON.stringify({ message: assistantMessage, success: true, provider }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Error in gazoo-chat function:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error', success: false }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
