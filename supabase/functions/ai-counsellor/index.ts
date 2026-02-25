// Supabase Edge Function for AI Counsellor Chat
// Handles mental health, financial, and academic counselling for StudentKonnect
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ─── Counsellor System Prompts ────────────────────────────────────────────────

const SYSTEM_PROMPTS: Record<string, string> = {
  mental: `You are MindMate, a compassionate mental health counsellor for South African university students. You provide:
- Empathetic listening and emotional support
- Evidence-based coping strategies for stress, anxiety, and depression
- Study-life balance advice
- Crisis support and referrals when needed
- Culturally sensitive guidance for South African students

Be warm, non-judgmental, and professional. Keep responses concise and supportive (2-4 paragraphs max).
If the student mentions self-harm or suicidal thoughts, immediately provide crisis hotlines:
Lifeline SA: 0800 567 567 | SADAG: 0800 456 789 | SMS: 31393`,

  financial: `You are FinanceGuru, an expert financial coach for South African university students. You provide:
- Practical budgeting advice for limited student income
- NSFAS fund management strategies
- Debt management and avoiding predatory loans (mashonisas)
- Savings strategies for students
- Smart spending habits and financial literacy
- Advice on student bursaries and funding

Be practical, encouraging, and realistic about student finances. Use Rand (R) currency and understand South African financial context. Keep responses concise and actionable (2-4 paragraphs max).`,

  academic: `You are StudyBuddy, an academic support counsellor for South African university students. You provide:
- Study planning and time management strategies
- Exam preparation techniques (including for UNISA distance learning)
- Assignment organisation tips
- Work-study-life balance advice
- Academic stress management
- Goal setting and motivation
- Understanding South African university systems (UNISA, Wits, UCT, UJ, SU, UKZN, DUT, TUT, NMU, etc.)

Be supportive, practical, and understand the pressure students face. Provide actionable strategies. Keep responses concise and helpful (2-4 paragraphs max).`,
};

const DEFAULT_SYSTEM_PROMPT = SYSTEM_PROMPTS.mental;

// ─── Edge Function ────────────────────────────────────────────────────────────

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get OpenAI API key from Supabase secrets
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      console.error("OpenAI API key not configured");
      return new Response(
        JSON.stringify({
          error: "OpenAI API key not configured in Edge Function",
          success: false,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse request body
    const { messages, counsellorType, sessionId } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({
          error: "Invalid request: messages array required",
          success: false,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const systemPrompt =
      SYSTEM_PROMPTS[counsellorType as string] || DEFAULT_SYSTEM_PROMPT;

    console.log(
      `AI Counsellor [${counsellorType}]: ${messages.length} messages`
    );

    // Call OpenAI API
    const openaiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "system", content: systemPrompt }, ...messages],
          temperature: 0.75,
          max_tokens: 600,
          presence_penalty: 0.3,
          frequency_penalty: 0.3,
        }),
      }
    );

    if (!openaiResponse.ok) {
      const error = await openaiResponse.json();
      console.error("OpenAI API error:", error);
      return new Response(
        JSON.stringify({
          error: `OpenAI API error: ${error.error?.message || "Unknown error"}`,
          success: false,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await openaiResponse.json();
    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      return new Response(
        JSON.stringify({ error: "No response from OpenAI", success: false }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Successfully got counsellor response");

    // Optionally save to database (non-critical)
    if (sessionId) {
      try {
        const authHeader = req.headers.get("Authorization");
        if (authHeader) {
          const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_ANON_KEY") ?? "",
            { global: { headers: { Authorization: authHeader } } }
          );
          await supabaseClient.from("counsellor_sessions").update({
            last_message: reply,
            updated_at: new Date().toISOString(),
          }).eq("id", sessionId);
        }
      } catch (dbError) {
        console.warn("DB update failed (non-fatal):", dbError);
      }
    }

    return new Response(
      JSON.stringify({ reply, success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in ai-counsellor function:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Internal server error",
        success: false,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
