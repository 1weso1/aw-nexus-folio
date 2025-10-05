-- Create blog_posts table
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  featured_image TEXT,
  author_name TEXT NOT NULL DEFAULT 'Ahmed Wesam',
  author_bio TEXT DEFAULT 'CRM & Automation specialist blending data-driven outreach with digital innovation.',
  author_image TEXT,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  read_time INTEGER DEFAULT 5,
  category TEXT DEFAULT 'General',
  tags TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create blog_seo_metadata table
CREATE TABLE IF NOT EXISTS public.blog_seo_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE NOT NULL UNIQUE,
  seo_title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  keywords TEXT[] DEFAULT '{}',
  related_workflow_ids UUID[] DEFAULT '{}',
  faq_schema JSONB,
  internal_links JSONB,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create workflow_seo_metadata table
CREATE TABLE IF NOT EXISTS public.workflow_seo_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES public.workflows(id) ON DELETE CASCADE NOT NULL UNIQUE,
  seo_title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  keywords TEXT[] DEFAULT '{}',
  related_blog_post_ids UUID[] DEFAULT '{}',
  schema_type TEXT DEFAULT 'SoftwareApplication',
  schema_data JSONB,
  faq_schema JSONB,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_seo_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_seo_metadata ENABLE ROW LEVEL SECURITY;

-- RLS policies for blog_posts
CREATE POLICY "Public can read published blog posts"
  ON public.blog_posts FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage blog posts"
  ON public.blog_posts FOR ALL
  USING (is_site_admin());

-- RLS policies for blog_seo_metadata
CREATE POLICY "Public can read blog SEO metadata"
  ON public.blog_seo_metadata FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage blog SEO metadata"
  ON public.blog_seo_metadata FOR ALL
  USING (is_site_admin());

-- RLS policies for workflow_seo_metadata
CREATE POLICY "Public can read workflow SEO metadata"
  ON public.workflow_seo_metadata FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage workflow SEO metadata"
  ON public.workflow_seo_metadata FOR ALL
  USING (is_site_admin());

-- Create indexes for better performance
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX idx_blog_posts_published_at ON public.blog_posts(published_at DESC);
CREATE INDEX idx_blog_posts_tags ON public.blog_posts USING GIN(tags);
CREATE INDEX idx_blog_seo_keywords ON public.blog_seo_metadata USING GIN(keywords);
CREATE INDEX idx_workflow_seo_keywords ON public.workflow_seo_metadata USING GIN(keywords);

-- Trigger to update updated_at
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blog_seo_updated_at
  BEFORE UPDATE ON public.blog_seo_metadata
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workflow_seo_updated_at
  BEFORE UPDATE ON public.workflow_seo_metadata
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();