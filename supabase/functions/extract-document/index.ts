import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { document_id } = await req.json();
    if (!document_id) {
      return new Response(JSON.stringify({ error: 'document_id is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      await supabase
        .from('document_captures')
        .update({ extraction_status: 'failed', extraction_error: 'OPENAI_API_KEY is not configured' })
        .eq('id', document_id);
      return new Response(JSON.stringify({ error: 'OPENAI_API_KEY is not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: doc, error: docError } = await supabase
      .from('document_captures')
      .select('id, storage_path')
      .eq('id', document_id)
      .single();

    if (docError || !doc) {
      return new Response(JSON.stringify({ error: 'Document not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    await supabase
      .from('document_captures')
      .update({ extraction_status: 'processing' })
      .eq('id', document_id);

    const { data: signedUrlData, error: signedUrlError } = await supabase
      .storage
      .from('document-captures')
      .createSignedUrl(doc.storage_path, 300);

    if (signedUrlError || !signedUrlData) {
      await supabase
        .from('document_captures')
        .update({ extraction_status: 'failed', extraction_error: 'Could not sign photo URL' })
        .eq('id', document_id);
      return new Response(JSON.stringify({ error: 'Could not sign photo URL' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content:
              'You read photos of military stores/quartermaster paperwork (forms, ledgers, labels). ' +
              'Transcribe all visible text verbatim, then extract any clear field/value pairs you can identify ' +
              '(e.g. form number, item name, quantity, date, names, serial numbers). ' +
              'Respond with strict JSON only, matching: {"transcript": string, "fields": {[key: string]: string}}. ' +
              'If a section is illegible, note it in the transcript rather than guessing.',
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Transcribe and extract fields from this document photo.' },
              { type: 'image_url', image_url: { url: signedUrlData.signedUrl } },
            ],
          },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 2000,
      }),
    });

    if (!openaiResponse.ok) {
      const errText = await openaiResponse.text();
      await supabase
        .from('document_captures')
        .update({ extraction_status: 'failed', extraction_error: `OpenAI error: ${errText.slice(0, 500)}` })
        .eq('id', document_id);
      return new Response(JSON.stringify({ error: 'Vision extraction failed', detail: errText }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const openaiData = await openaiResponse.json();
    const content = openaiData.choices?.[0]?.message?.content ?? '{}';

    let parsed: { transcript?: string; fields?: Record<string, string> } = {};
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { transcript: content, fields: {} };
    }

    await supabase
      .from('document_captures')
      .update({
        extraction_status: 'done',
        extracted_text: parsed.transcript ?? null,
        extracted_fields: parsed.fields ?? {},
        extraction_error: null,
      })
      .eq('id', document_id);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[extract-document] Error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
