-- Complete Automation Platform Database Setup

-- Create user profiles table for additional user data
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email TEXT,
  full_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view their own profile" 
ON public.user_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.user_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create tags table for workflow categorization
CREATE TABLE IF NOT EXISTS public.tags (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

-- Enable RLS on tags (public read access)
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_tags" 
ON public.tags 
FOR SELECT 
USING (true);

-- Create workflows table for storing n8n workflow metadata
CREATE TABLE IF NOT EXISTS public.workflows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  raw_url TEXT NOT NULL,
  size_bytes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE,
  category TEXT DEFAULT 'General',
  node_count INTEGER DEFAULT 0,
  has_credentials BOOLEAN DEFAULT false,
  complexity TEXT DEFAULT 'Easy',
  search_tsv TSVECTOR
);

-- Enable RLS on workflows (public read access)
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_workflows" 
ON public.workflows 
FOR SELECT 
USING (true);

-- Create workflow_tags junction table
CREATE TABLE IF NOT EXISTS public.workflow_tags (
  workflow_id UUID NOT NULL,
  tag_id INTEGER NOT NULL,
  PRIMARY KEY (workflow_id, tag_id)
);

-- Enable RLS on workflow_tags (public read access)
ALTER TABLE public.workflow_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_workflow_tags" 
ON public.workflow_tags 
FOR SELECT 
USING (true);

-- Create workflow_downloads table for tracking downloads
CREATE TABLE IF NOT EXISTS public.workflow_downloads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  workflow_id UUID NOT NULL,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ip_address INET,
  user_agent TEXT
);

-- Enable RLS on workflow_downloads
ALTER TABLE public.workflow_downloads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own downloads" 
ON public.workflow_downloads 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own download records" 
ON public.workflow_downloads 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create workflow_favorites table for user favorites
CREATE TABLE IF NOT EXISTS public.workflow_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  workflow_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, workflow_id)
);

-- Enable RLS on workflow_favorites
ALTER TABLE public.workflow_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own favorites" 
ON public.workflow_favorites 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own favorites" 
ON public.workflow_favorites 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own favorites" 
ON public.workflow_favorites 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create workflow_collections table for user-created collections
CREATE TABLE IF NOT EXISTS public.workflow_collections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on workflow_collections
ALTER TABLE public.workflow_collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own collections" 
ON public.workflow_collections 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own collections" 
ON public.workflow_collections 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Public collections are viewable by everyone" 
ON public.workflow_collections 
FOR SELECT 
USING (is_public = true);

-- Create workflow_collection_items table for collection contents
CREATE TABLE IF NOT EXISTS public.workflow_collection_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id UUID NOT NULL,
  workflow_id UUID NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(collection_id, workflow_id)
);

-- Enable RLS on workflow_collection_items
ALTER TABLE public.workflow_collection_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view items in their own collections" 
ON public.workflow_collection_items 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM workflow_collections 
  WHERE workflow_collections.id = workflow_collection_items.collection_id 
  AND workflow_collections.user_id = auth.uid()
));

CREATE POLICY "Users can manage items in their own collections" 
ON public.workflow_collection_items 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM workflow_collections 
  WHERE workflow_collections.id = workflow_collection_items.collection_id 
  AND workflow_collections.user_id = auth.uid()
));

CREATE POLICY "Items in public collections are viewable by everyone" 
ON public.workflow_collection_items 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM workflow_collections 
  WHERE workflow_collections.id = workflow_collection_items.collection_id 
  AND workflow_collections.is_public = true
));

-- Create function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name')
  );
  RETURN NEW;
END;
$$;

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create function for workflow upsertion (for syncing from external sources)
CREATE OR REPLACE FUNCTION public.upsert_workflow(
  p_slug TEXT,
  p_name TEXT,
  p_path TEXT,
  p_raw_url TEXT,
  p_size INTEGER,
  p_updated TIMESTAMP WITH TIME ZONE,
  p_category TEXT,
  p_node_count INTEGER,
  p_has_credentials BOOLEAN,
  p_complexity TEXT,
  p_tags TEXT[]
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  w_id UUID;
  t TEXT;
  t_id INTEGER;
BEGIN
  -- Delete existing workflow tags if workflow exists
  IF EXISTS(SELECT 1 FROM workflows WHERE slug = p_slug) THEN
    DELETE FROM workflow_tags WHERE workflow_id = (SELECT id FROM workflows WHERE slug = p_slug);
  END IF;

  -- Insert or update workflow
  INSERT INTO workflows (
    slug, name, path, raw_url, size_bytes, updated_at, category, 
    node_count, has_credentials, complexity, search_tsv
  )
  VALUES (
    p_slug, p_name, p_path, p_raw_url, p_size, p_updated, 
    COALESCE(p_category, 'General'), p_node_count, p_has_credentials, p_complexity,
    setweight(to_tsvector('simple', COALESCE(p_name, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(p_category, '')), 'B')
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    path = EXCLUDED.path,
    raw_url = EXCLUDED.raw_url,
    size_bytes = EXCLUDED.size_bytes,
    updated_at = EXCLUDED.updated_at,
    category = EXCLUDED.category,
    node_count = EXCLUDED.node_count,
    has_credentials = EXCLUDED.has_credentials,
    complexity = EXCLUDED.complexity,
    search_tsv = EXCLUDED.search_tsv
  RETURNING id INTO w_id;

  -- Get workflow ID if it wasn't returned (existing record)
  IF w_id IS NULL THEN
    SELECT id INTO w_id FROM workflows WHERE slug = p_slug;
  END IF;

  -- Insert tags and workflow_tags
  IF p_tags IS NOT NULL THEN
    FOREACH t IN ARRAY p_tags LOOP
      IF t IS NOT NULL AND trim(t) <> '' THEN
        INSERT INTO tags (name) VALUES (lower(trim(t))) ON CONFLICT (name) DO NOTHING;
        SELECT id INTO t_id FROM tags WHERE name = lower(trim(t));
        INSERT INTO workflow_tags (workflow_id, tag_id) VALUES (w_id, t_id) ON CONFLICT DO NOTHING;
      END IF;
    END LOOP;
  END IF;

  RETURN w_id;
END;
$$;

-- Create function to check if user is site admin
CREATE OR REPLACE FUNCTION public.is_site_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Replace with your actual admin email
  SELECT EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE id = auth.uid() 
    AND email = 'contact@ahmedwesam.com'
  );
$$;

-- Create triggers for automatic profile creation and timestamp updates
DO $$
BEGIN
  -- Only create trigger if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END;
$$;

-- Add triggers for updated_at columns
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workflow_collections_updated_at
  BEFORE UPDATE ON public.workflow_collections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workflows_category ON public.workflows(category);
CREATE INDEX IF NOT EXISTS idx_workflows_complexity ON public.workflows(complexity);
CREATE INDEX IF NOT EXISTS idx_workflows_node_count ON public.workflows(node_count);
CREATE INDEX IF NOT EXISTS idx_workflows_search_tsv ON public.workflows USING GIN(search_tsv);
CREATE INDEX IF NOT EXISTS idx_workflow_downloads_user_id ON public.workflow_downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_downloads_workflow_id ON public.workflow_downloads(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_favorites_user_id ON public.workflow_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_collections_user_id ON public.workflow_collections(user_id);

COMMENT ON TABLE public.workflows IS 'Stores n8n workflow metadata and information';
COMMENT ON TABLE public.user_profiles IS 'Extended user profile information';
COMMENT ON TABLE public.workflow_downloads IS 'Tracks workflow downloads by users';
COMMENT ON TABLE public.workflow_favorites IS 'User favorite workflows';
COMMENT ON TABLE public.workflow_collections IS 'User-created workflow collections';
COMMENT ON FUNCTION public.upsert_workflow IS 'Function to sync workflows from external sources';