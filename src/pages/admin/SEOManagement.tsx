import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Sparkles, FileText, Workflow, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { BLOG_ARTICLES } from "@/data/blogArticles";

export default function SEOManagement() {
  const [importing, setImporting] = useState(false);
  const [generatingBlogSEO, setGeneratingBlogSEO] = useState(false);
  const [generatingWorkflowSEO, setGeneratingWorkflowSEO] = useState(false);
  const [blogProgress, setBlogProgress] = useState(0);
  const [workflowProgress, setWorkflowProgress] = useState(0);
  const [stats, setStats] = useState({
    totalBlogs: 0,
    blogsWithSEO: 0,
    totalWorkflows: 0,
    workflowsWithSEO: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const { count: totalBlogs } = await supabase
      .from('blog_posts')
      .select('*', { count: 'exact', head: true });

    const { count: blogsWithSEO } = await supabase
      .from('blog_seo_metadata')
      .select('*', { count: 'exact', head: true });

    const { count: totalWorkflows } = await supabase
      .from('workflows')
      .select('*', { count: 'exact', head: true });

    const { count: workflowsWithSEO } = await supabase
      .from('workflow_seo_metadata')
      .select('*', { count: 'exact', head: true });

    setStats({
      totalBlogs: totalBlogs || 0,
      blogsWithSEO: blogsWithSEO || 0,
      totalWorkflows: totalWorkflows || 0,
      workflowsWithSEO: workflowsWithSEO || 0,
    });
  };

  const importBlogArticles = async () => {
    setImporting(true);
    try {
      const articles = BLOG_ARTICLES; // Defined below
      
      for (let i = 0; i < articles.length; i++) {
        const article = articles[i];
        const { error } = await supabase
          .from('blog_posts')
          .upsert({
            slug: article.slug,
            title: article.title,
            excerpt: article.excerpt,
            content: article.content,
            category: article.category,
            tags: article.tags,
            is_featured: article.is_featured,
            read_time: article.read_time,
          }, { onConflict: 'slug' });

        if (error) {
          console.error(`Error importing ${article.title}:`, error);
        }
        setBlogProgress(Math.round(((i + 1) / articles.length) * 100));
      }

      toast.success(`Successfully imported ${articles.length} blog articles!`);
      await fetchStats();
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import articles');
    } finally {
      setImporting(false);
      setBlogProgress(0);
    }
  };

  const generateBlogSEO = async () => {
    setGeneratingBlogSEO(true);
    setBlogProgress(0);

    try {
      const { data: blogs, error } = await supabase
        .from('blog_posts')
        .select('id, slug, title');

      if (error || !blogs) throw error;

      for (let i = 0; i < blogs.length; i++) {
        const blog = blogs[i];
        
        const { error: invokeError } = await supabase.functions.invoke('generate-blog-seo', {
          body: { postId: blog.id }
        });

        if (invokeError) {
          console.error(`SEO generation failed for ${blog.title}:`, invokeError);
          toast.error(`Failed: ${blog.title}`);
        } else {
          console.log(`✓ Generated SEO for: ${blog.title}`);
        }

        setBlogProgress(Math.round(((i + 1) / blogs.length) * 100));
        await new Promise(resolve => setTimeout(resolve, 500)); // Rate limiting
      }

      toast.success(`SEO generated for ${blogs.length} blog posts!`);
      await fetchStats();
    } catch (error) {
      console.error('Blog SEO generation error:', error);
      toast.error('Failed to generate blog SEO');
    } finally {
      setGeneratingBlogSEO(false);
      setBlogProgress(0);
    }
  };

  const generateWorkflowSEO = async () => {
    setGeneratingWorkflowSEO(true);
    setWorkflowProgress(0);

    try {
      const batchSize = 50;
      let offset = 0;
      let hasMore = true;
      let totalProcessed = 0;

      while (hasMore) {
        const { data, error } = await supabase.functions.invoke('enhance-workflow-seo', {
          body: { batchSize, offset }
        });

        if (error) {
          console.error('Batch error:', error);
          toast.error(`Batch failed at offset ${offset}: ${error.message}`);
          break;
        }

        totalProcessed += data.processed;
        const progress = Math.min(Math.round((totalProcessed / stats.totalWorkflows) * 100), 100);
        setWorkflowProgress(progress);

        console.log(`Batch complete: ${data.succeeded}/${data.processed} succeeded`);

        hasMore = data.hasMore;
        offset = data.nextOffset;

        if (hasMore) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      toast.success(`Workflow SEO generation complete! Processed ${totalProcessed} workflows.`);
      await fetchStats();
    } catch (error) {
      console.error('Workflow SEO generation error:', error);
      toast.error('Failed to generate workflow SEO');
    } finally {
      setGeneratingWorkflowSEO(false);
      setWorkflowProgress(0);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">SEO Management</h1>
        <p className="text-muted-foreground">
          Import blog articles and generate AI-powered SEO metadata using Gemini
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Blog Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBlogs}</div>
            <p className="text-xs text-muted-foreground">Total articles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Blog SEO</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.blogsWithSEO}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalBlogs > 0 
                ? `${Math.round((stats.blogsWithSEO / stats.totalBlogs) * 100)}% complete` 
                : '0% complete'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Workflows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalWorkflows}</div>
            <p className="text-xs text-muted-foreground">Total workflows</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Workflow SEO</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.workflowsWithSEO}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalWorkflows > 0 
                ? `${Math.round((stats.workflowsWithSEO / stats.totalWorkflows) * 100)}% complete` 
                : '0% complete'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Blog Articles Management */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Blog Articles
              </CardTitle>
              <CardDescription>
                Import and optimize your 27 blog articles
              </CardDescription>
            </div>
            <Badge variant="secondary">
              <Sparkles className="h-3 w-3 mr-1" />
              Gemini Powered
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={importBlogArticles}
              disabled={importing}
              className="flex-1"
            >
              {importing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Import All 27 Articles
                </>
              )}
            </Button>

            <Button
              onClick={generateBlogSEO}
              disabled={generatingBlogSEO || stats.totalBlogs === 0}
              variant="secondary"
              className="flex-1"
            >
              {generatingBlogSEO ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating SEO...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate SEO for All Blogs
                </>
              )}
            </Button>
          </div>

          {blogProgress > 0 && (
            <div className="space-y-2">
              <Progress value={blogProgress} className="h-2" />
              <p className="text-sm text-muted-foreground text-center">
                {blogProgress}% complete
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Workflow SEO Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="h-5 w-5" />
                Workflow SEO Enhancement
              </CardTitle>
              <CardDescription>
                Generate SEO metadata for 2000+ workflows with structured data
              </CardDescription>
            </div>
            <Badge variant="secondary">
              <Sparkles className="h-3 w-3 mr-1" />
              Batch Processing
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={generateWorkflowSEO}
            disabled={generatingWorkflowSEO || stats.totalWorkflows === 0}
            className="w-full"
            size="lg"
          >
            {generatingWorkflowSEO ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating Workflow SEO...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Generate SEO for All {stats.totalWorkflows} Workflows
              </>
            )}
          </Button>

          {workflowProgress > 0 && (
            <div className="space-y-2">
              <Progress value={workflowProgress} className="h-2" />
              <p className="text-sm text-muted-foreground text-center">
                {workflowProgress}% complete ({Math.round((workflowProgress / 100) * stats.totalWorkflows)} / {stats.totalWorkflows} workflows)
              </p>
            </div>
          )}

          <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 text-primary" />
              <div>
                <p className="font-medium">Free Gemini Processing Until Oct 6, 2025</p>
                <p className="text-muted-foreground">
                  Batch processing uses google/gemini-2.5-flash which is free during this period. 
                  Processing ~20 workflows per batch with rate limiting to avoid API limits.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


