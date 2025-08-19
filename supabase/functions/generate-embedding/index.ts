import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    const { text } = await req.json()

    if (!text) {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // For development, return a dummy embedding
    // In production, you would call a real embedding service like:
    // - Hugging Face Transformers.js
    // - OpenAI Embeddings API
    // - Local sentence-transformers model
    
    // Generate a consistent but dummy embedding based on text hash
    const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
    const hashArray = Array.from(new Uint8Array(hash))
    
    // Create 384-dimensional embedding (matching multilingual-e5-base)
    const embedding = Array(384).fill(0).map((_, i) => {
      const seed = hashArray[i % hashArray.length]
      return (seed / 255) * 2 - 1 // Normalize to [-1, 1]
    })

    return new Response(
      JSON.stringify({ embedding }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})