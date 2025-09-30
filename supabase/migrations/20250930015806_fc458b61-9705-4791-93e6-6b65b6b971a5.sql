-- Create a function to match workflows by embedding similarity
CREATE OR REPLACE FUNCTION match_workflows(
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
    workflow_vectors.workflow_id,
    1 - (workflow_vectors.embedding <=> query_embedding) as similarity,
    workflow_vectors.description_text
  FROM workflow_vectors
  WHERE 1 - (workflow_vectors.embedding <=> query_embedding) > match_threshold
  ORDER BY workflow_vectors.embedding <=> query_embedding
  LIMIT match_count;
$$;