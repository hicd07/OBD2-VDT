import "jsr:@supabase/functions-js/edge-runtime.d.ts";

interface ProcedureRequest {
  dtcCode: string;
  year: string;
  brand: string;
  model: string;
  language?: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

function generateProcedurePrompt(dtcCode: string, year: string, brand: string, model: string, language: string): string {
  return `You are an expert automotive technician. Generate a detailed, step-by-step service procedure to diagnose and fix the DTC code ${dtcCode} on a ${year} ${brand} ${model}.

Provide the response in the following structured format:

## MOST LIKELY CAUSES
- List 3-5 of the most probable causes

## DIAGNOSTIC PROCEDURE
Step-by-step diagnostic guide:
1. [First diagnostic step]
2. [Second diagnostic step]
3. [Continue with detailed steps]

## REPAIR PROCEDURE
If diagnosis confirms an issue:
1. [First repair step]
2. [Second repair step]
3. [Continue with detailed repair steps]

## TOOLS REQUIRED
- List tools and equipment needed

## SAFETY PRECAUTIONS
- List important safety considerations

## ESTIMATED REPAIR TIME
- Provide realistic time estimate

Provide the response in ${language} language. Be detailed and practical.`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Only POST requests are supported" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const payload: ProcedureRequest = await req.json();
    const { dtcCode, year, brand, model, language = "English" } = payload;

    if (!dtcCode || !year || !brand || !model) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: dtcCode, year, brand, model" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Gemini API key not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const prompt = generateProcedurePrompt(dtcCode, year, brand, model, language);

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const content = data.candidates[0].content.parts[0].text;
      return new Response(
        JSON.stringify({
          success: true,
          procedure: content,
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    } else {
      throw new Error("Invalid response format from Gemini API");
    }
  } catch (error) {
    console.error("Service procedure generation error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate service procedure",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
