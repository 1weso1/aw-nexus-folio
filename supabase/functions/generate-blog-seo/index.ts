import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { postId, postSlug } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch blog post
    const { data: post, error: postError } = await supabase
      .from('blog_posts')
      .select('*')
      .or(postId ? `id.eq.${postId}` : `slug.eq.${postSlug}`)
      .single();

    if (postError || !post) {
      throw new Error(`Blog post not found: ${postError?.message}`);
    }

    console.log(`Generating SEO for blog post: ${post.title}`);

    // Fetch top 20 workflows for internal linking suggestions
    const { data: workflows } = await supabase
      .from('workflows')
      .select('id, name, slug, category, complexity')
      .limit(20);

    const workflowList = workflows?.map(w => `- ${w.name} (${w.category}, ${w.complexity})`).join('\n') || '';

    // Generate SEO with Gemini
    const prompt = `You are an SEO expert optimizing content for "Ahmed Wesam", a CRM & Automation specialist.

Blog Post Details:
Title: ${post.title}
Excerpt: ${post.excerpt}
Category: ${post.category}
Tags: ${post.tags?.join(', ') || 'None'}
Content Preview: ${post.content.substring(0, 500)}...

Available Workflows for Internal Linking:
${workflowList}

Target Keywords: "CRM Automation", "Automation Architect", "HubSpot", "n8n", "Ahmed Wesam", "Supabase", "workflow automation", "${post.category}"

Generate comprehensive SEO metadata in the following JSON structure:
{
  "seo_title": "Optimized title (max 60 chars, include main keyword)",
  "meta_description": "Compelling description (max 160 chars, include target keyword)",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "related_workflow_slugs": ["workflow-slug-1", "workflow-slug-2", "workflow-slug-3"],
  "faq_schema": [
    {"question": "Relevant question?", "answer": "Clear answer based on content"}
  ],
  "internal_links": {
    "workflows": ["Suggest 3-5 relevant workflow links from the list above"],
    "anchor_texts": ["Natural anchor text for each workflow"]
  }
}

Return ONLY valid JSON.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are an SEO expert. Return only valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API Error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0].message.content;
    
    let seoData;
    try {
      seoData = JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Invalid JSON from AI');
    }

    // Convert workflow slugs to IDs
    const relatedWorkflowIds = [];
    if (seoData.related_workflow_slugs && workflows) {
      for (const slug of seoData.related_workflow_slugs) {
        const workflow = workflows.find(w => w.slug === slug);
        if (workflow) relatedWorkflowIds.push(workflow.id);
      }
    }

    // Upsert SEO metadata
    const { error: upsertError } = await supabase
      .from('blog_seo_metadata')
      .upsert({
        blog_post_id: post.id,
        seo_title: seoData.seo_title,
        meta_description: seoData.meta_description,
        keywords: seoData.keywords,
        related_workflow_ids: relatedWorkflowIds,
        faq_schema: seoData.faq_schema,
        internal_links: seoData.internal_links,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'blog_post_id' });

    if (upsertError) {
      console.error('Database upsert error:', upsertError);
      throw upsertError;
    }

    console.log(`SEO generated successfully for: ${post.title}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        post_id: post.id,
        seo_data: seoData,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-blog-seo:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
