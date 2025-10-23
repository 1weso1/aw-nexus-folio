-- Add new column for Deepseek embeddings alongside existing Gemini embeddings
ALTER TABLE public.workflow_vectors 
ADD COLUMN IF NOT EXISTS embedding_deepseek vector(768);

-- Add metadata column to track which embedding model was used
ALTER TABLE public.workflow_vectors 
ADD COLUMN IF NOT EXISTS embedding_model text DEFAULT 'gemini';

-- Rename existing embedding column for clarity
ALTER TABLE public.workflow_vectors 
RENAME COLUMN embedding TO embedding_gemini;

-- Create index for Deepseek embeddings for faster similarity search
CREATE INDEX IF NOT EXISTS idx_workflow_vectors_embedding_deepseek 
ON public.workflow_vectors USING ivfflat (embedding_deepseek vector_cosine_ops)
WITH (lists = 100);

-- Create new RPC function for Deepseek embedding search
CREATE OR REPLACE FUNCTION match_workflows_deepseek(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.3,
  match_count int DEFAULT 20
)
RETURNS TABLE (
  workflow_id uuid,
  similarity float,
  description_text text
)
LANGUAGE sql STABLE
AS $$
  SELECT
    workflow_id,
    1 - (embedding_deepseek <=> query_embedding) as similarity,
    description_text
  FROM workflow_vectors
  WHERE embedding_deepseek IS NOT NULL
    AND 1 - (embedding_deepseek <=> query_embedding) > match_threshold
  ORDER BY embedding_deepseek <=> query_embedding
  LIMIT match_count;
$$;