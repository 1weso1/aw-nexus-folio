-- Create workflow_descriptions table
CREATE TABLE public.workflow_descriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  use_cases TEXT,
  setup_guide TEXT,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(workflow_id)
);

-- Enable RLS
ALTER TABLE public.workflow_descriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read workflow descriptions
CREATE POLICY "Anyone can read workflow descriptions"
ON public.workflow_descriptions
FOR SELECT
USING (true);

-- Create index for faster lookups
CREATE INDEX idx_workflow_descriptions_workflow_id ON public.workflow_descriptions(workflow_id);