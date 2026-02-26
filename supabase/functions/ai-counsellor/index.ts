// Supabase Edge Function for AI Counsellor Chat
// Uses Gemini 2.5 Flash (primary) with OpenAI gpt-4o-mini as fallback
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ─── Counsellor System Prompts ────────────────────────────────────────────────

const SYSTEM_PROMPTS: Record<string, string> = {
  mental: `You are MindMate, a compassionate mental health counsellor for university students worldwide. You provide:
- Empathetic listening and emotional support
- Evidence-based coping strategies for stress, anxiety, and depression
- Study-life balance advice
- Crisis support and referrals when needed
- Culturally sensitive guidance

Be warm, non-judgmental, and professional. Keep responses concise and supportive (2-4 paragraphs max).
If the student mentions self-harm or suicidal thoughts, immediately provide crisis resources:
International Association for Suicide Prevention: https://www.iasp.info/resources/Crisis_Centres/
Lifeline (if in South Africa): 0800 567 567 | SADAG: 0800 456 789`,

  financial: `You are FinanceGuru, an expert financial coach for university students. You provide:
- Practical budgeting advice for limited student income
- Student loan and bursary management strategies
- Debt management and avoiding predatory loans
- Savings strategies for students
- Smart spending habits and financial literacy
- Advice on student funding and scholarships

Be practical, encouraging, and realistic about student finances. Keep responses concise and actionable (2-4 paragraphs max).`,

  academic: `You are StudyBuddy, an academic support counsellor for university students worldwide. You provide:
- Study planning and time management strategies
- Exam preparation techniques
- Assignment organisation tips
- Work-study-life balance advice
- Academic stress management
- Goal setting and motivation
- Understanding university systems and processes

Be supportive, practical, and understand the pressure students face. Provide actionable strategies. Keep responses concise and helpful (2-4 paragraphs max).`,
};

const DEFAULT_SYSTEM_PROMPT = SYSTEM_PROMPTS.mental;

// ─── AI Provider Functions ────────────────────────────────────────────────────

async function callGemini(
  messages: { role: string; content: string }[],
  systemPrompt: string
): Promise<string> {
  const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
  if (!geminiApiKey) throw new Error("Gemini API key not configured");

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${geminiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemini-2.5-flash",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        temperature: 0.75,
        max_tokens: 600,
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || `Gemini error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty response from Gemini");
  return content;
}

async function callOpenAI(
  messages: { role: string; content: string }[],
  systemPrompt: string
): Promise<string> {
  const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
  if (!openaiApiKey) throw new Error("OpenAI API key not configured");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
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
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.error?.message || `OpenAI error: ${response.status}`
    );
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty response from OpenAI");
  return content;
}

// ─── Edge Function ────────────────────────────────────────────────────────────

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
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

    // Try Gemini first, fall back to OpenAI
    let reply: string;
    let provider = "gemini";

    try {
      reply = await callGemini(messages, systemPrompt);
      console.log("Successfully got counsellor response from Gemini");
    } catch (geminiError: any) {
      console.warn(
        "Gemini failed for counsellor, trying OpenAI fallback:",
        geminiError.message
      );
      provider = "openai";
      try {
        reply = await callOpenAI(messages, systemPrompt);
        console.log("Successfully got counsellor response from OpenAI fallback");
      } catch (openaiError: any) {
        console.error("Both AI providers failed:", openaiError.message);
        return new Response(
          JSON.stringify({
            error: `AI service unavailable. Please try again later.`,
            success: false,
          }),
          {
            status: 503,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

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
          await supabaseClient
            .from("counsellor_sessions")
            .update({
              last_message: reply,
              updated_at: new Date().toISOString(),
            })
            .eq("id", sessionId);
        }
      } catch (dbError) {
        console.warn("DB update failed (non-fatal):", dbError);
      }
    }

    return new Response(
      JSON.stringify({ reply, success: true, provider }),
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
