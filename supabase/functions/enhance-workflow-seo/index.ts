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
    const { workflowId, workflowSlug, batchSize = 10, offset = 0 } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    let workflows = [];
    
    // Single workflow or batch processing
    if (workflowId || workflowSlug) {
      const { data: workflow, error: wError } = await supabase
        .from('workflows')
        .select('*')
        .or(workflowId ? `id.eq.${workflowId}` : `slug.eq.${workflowSlug}`)
        .single();

      if (wError || !workflow) {
        throw new Error(`Workflow not found: ${wError?.message}`);
      }

      const { data: description } = await supabase
        .from('workflow_descriptions')
        .select('*')
        .eq('workflow_id', workflow.id)
        .single();

      workflows = [{
        ...workflow,
        description: description?.description,
        use_cases: description?.use_cases,
        setup_guide: description?.setup_guide
      }];
    } else {
      // Batch: find workflows without SEO metadata
      // First get all workflow IDs that already have SEO
      const { data: existingSEO } = await supabase
        .from('workflow_seo_metadata')
        .select('workflow_id');
      
      const existingIds = existingSEO?.map(s => s.workflow_id) || [];
      
      // Fetch workflows that don't have SEO
      let query = supabase
        .from('workflows')
        .select('*')
        .range(offset, offset + batchSize - 1);
      
      if (existingIds.length > 0) {
        query = query.not('id', 'in', `(${existingIds.join(',')})`);
      }
      
      const { data: workflowData, error } = await query;

      if (error) throw error;
      
      // Fetch descriptions for these workflows
      if (workflowData && workflowData.length > 0) {
        const workflowIds = workflowData.map(w => w.id);
        const { data: descriptions } = await supabase
          .from('workflow_descriptions')
          .select('*')
          .in('workflow_id', workflowIds);
        
        const descMap = new Map(descriptions?.map(d => [d.workflow_id, d]) || []);
        
        workflows = workflowData.map(w => {
          const desc = descMap.get(w.id);
          return {
            ...w,
            description: desc?.description,
            use_cases: desc?.use_cases,
            setup_guide: desc?.setup_guide
          };
        });
      } else {
        workflows = [];
      }
    }

    if (workflows.length === 0) {
      return new Response(
        JSON.stringify({ success: true, processed: 0, message: 'No workflows to process' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch blog posts for internal linking
    const { data: blogPosts } = await supabase
      .from('blog_posts')
      .select('id, slug, title, category, tags')
      .limit(20);

    const results = [];
    let successCount = 0;
    let failCount = 0;

    for (const workflow of workflows) {
      try {
        console.log(`Enhancing SEO for workflow: ${workflow.name}`);

        if (!workflow.description) {
          console.log(`Skipping ${workflow.name}: No description found`);
          failCount++;
          continue;
        }

        const blogList = blogPosts?.map(b => `- ${b.title} (${b.category})`).join('\n') || '';

        const prompt = `You are an SEO expert optimizing a workflow automation for "Ahmed Wesam", an Automation Architect.

Workflow Details:
Name: ${workflow.name}
Category: ${workflow.category}
Complexity: ${workflow.complexity}
Node Count: ${workflow.node_count}
Has Credentials: ${workflow.has_credentials}
Description: ${workflow.description}
Use Cases: ${workflow.use_cases || 'N/A'}
Setup Guide: ${workflow.setup_guide || 'N/A'}

Available Blog Posts for Internal Linking:
${blogList}

Target Keywords: "n8n workflow", "automation", "${workflow.category}", "${workflow.complexity} automation", "workflow template", "Ahmed Wesam", "${workflow.name}"

Generate comprehensive SEO metadata in the following JSON structure:
{
  "seo_title": "Optimized title (max 60 chars, include workflow name + benefit)",
  "meta_description": "Compelling description (max 160 chars, clear value proposition)",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "related_blog_slugs": ["blog-slug-1", "blog-slug-2"],
  "schema_type": "SoftwareApplication or HowTo",
  "schema_data": {
    "name": "${workflow.name}",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": {"@type": "Offer", "price": "0", "priceCurrency": "USD"}
  },
  "faq_schema": [
    {"question": "What does this workflow do?", "answer": "Based on description"},
    {"question": "How complex is this workflow?", "answer": "Based on complexity"}
  ]
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
          console.error(`AI API error for ${workflow.name}:`, aiResponse.status);
          failCount++;
          continue;
        }

        const aiData = await aiResponse.json();
        let content = aiData.choices[0].message.content;
        
        // Strip markdown code blocks if present
        content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        let seoData;
        try {
          seoData = JSON.parse(content);
        } catch (e) {
          console.error(`JSON parse error for ${workflow.name}:`, content);
          failCount++;
          continue;
        }

        // Convert blog slugs to IDs
        const relatedBlogIds = [];
        if (seoData.related_blog_slugs && blogPosts) {
          for (const slug of seoData.related_blog_slugs) {
            const blog = blogPosts.find(b => b.slug === slug);
            if (blog) relatedBlogIds.push(blog.id);
          }
        }

        // Upsert SEO metadata
        const { error: upsertError } = await supabase
          .from('workflow_seo_metadata')
          .upsert({
            workflow_id: workflow.id,
            seo_title: seoData.seo_title,
            meta_description: seoData.meta_description,
            keywords: seoData.keywords,
            related_blog_post_ids: relatedBlogIds,
            schema_type: seoData.schema_type || 'SoftwareApplication',
            schema_data: seoData.schema_data,
            faq_schema: seoData.faq_schema,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'workflow_id' });

        if (upsertError) {
          console.error(`DB error for ${workflow.name}:`, upsertError);
          failCount++;
        } else {
          console.log(`✓ SEO enhanced for: ${workflow.name}`);
          successCount++;
          results.push({ workflow_id: workflow.id, name: workflow.name, success: true });
        }

        // Rate limiting: small delay between requests
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error) {
        console.error(`Error processing ${workflow.name}:`, error);
        failCount++;
        results.push({ workflow_id: workflow.id, name: workflow.name, success: false, error: error.message });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        processed: workflows.length,
        succeeded: successCount,
        failed: failCount,
        results,
        nextOffset: offset + batchSize,
        hasMore: workflows.length === batchSize,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in enhance-workflow-seo:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
