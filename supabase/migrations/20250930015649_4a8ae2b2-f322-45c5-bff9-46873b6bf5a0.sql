-- Enable pgvector extension (fallback to float[] if not available)
CREATE EXTENSION IF NOT EXISTS vector;

-- Create workflow_vectors table to store embeddings
CREATE TABLE IF NOT EXISTS public.workflow_vectors (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id uuid NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
  embedding vector(768),
  description_text text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(workflow_id)
);

-- Create index for vector similarity search (cosine distance)
CREATE INDEX IF NOT EXISTS workflow_vectors_embedding_idx 
ON public.workflow_vectors 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create index for workflow_id lookups
CREATE INDEX IF NOT EXISTS workflow_vectors_workflow_id_idx 
ON public.workflow_vectors(workflow_id);

-- Enable RLS
ALTER TABLE public.workflow_vectors ENABLE ROW LEVEL SECURITY;

-- Allow public read access (same as workflows table)
CREATE POLICY "public_read_workflow_vectors" 
ON public.workflow_vectors 
FOR SELECT 
USING (true);

-- Create trigger to update updated_at
CREATE TRIGGER update_workflow_vectors_updated_at
BEFORE UPDATE ON public.workflow_vectors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();