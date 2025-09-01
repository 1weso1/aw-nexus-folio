-- Create user profiles table for automation platform
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view their own profile"
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create workflow downloads tracking table
CREATE TABLE IF NOT EXISTS public.workflow_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ip_address INET,
  user_agent TEXT
);

-- Enable RLS on workflow_downloads
ALTER TABLE public.workflow_downloads ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for workflow_downloads
CREATE POLICY "Users can view their own downloads"
  ON public.workflow_downloads
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own download records"
  ON public.workflow_downloads
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create workflow favorites table
CREATE TABLE IF NOT EXISTS public.workflow_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, workflow_id)
);

-- Enable RLS on workflow_favorites
ALTER TABLE public.workflow_favorites ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for workflow_favorites
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

-- Create workflow collections table
CREATE TABLE IF NOT EXISTS public.workflow_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on workflow_collections
ALTER TABLE public.workflow_collections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for workflow_collections
CREATE POLICY "Users can view their own collections"
  ON public.workflow_collections
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Public collections are viewable by everyone"
  ON public.workflow_collections
  FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can manage their own collections"
  ON public.workflow_collections
  FOR ALL
  USING (auth.uid() = user_id);

-- Create workflow collection items table
CREATE TABLE IF NOT EXISTS public.workflow_collection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES public.workflow_collections(id) ON DELETE CASCADE,
  workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(collection_id, workflow_id)
);

-- Enable RLS on workflow_collection_items
ALTER TABLE public.workflow_collection_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for workflow_collection_items
CREATE POLICY "Users can view items in their own collections"
  ON public.workflow_collection_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workflow_collections 
      WHERE id = collection_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Items in public collections are viewable by everyone"
  ON public.workflow_collection_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workflow_collections 
      WHERE id = collection_id AND is_public = true
    )
  );

CREATE POLICY "Users can manage items in their own collections"
  ON public.workflow_collection_items
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.workflow_collections 
      WHERE id = collection_id AND user_id = auth.uid()
    )
  );

-- Create function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workflow_collections_updated_at
  BEFORE UPDATE ON public.workflow_collections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();