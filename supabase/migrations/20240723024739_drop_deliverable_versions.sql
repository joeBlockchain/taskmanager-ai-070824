-- Drop the trigger
DROP TRIGGER IF EXISTS version_markdown_content_trigger ON public.deliverable_content;

-- Drop the function
DROP FUNCTION IF EXISTS version_markdown_content();

-- Drop the policy on deliverable_content_versions
DROP POLICY IF EXISTS "Users can view versions of their own deliverable content" ON public.deliverable_content_versions;

-- Drop the deliverable_content_versions table
DROP TABLE IF EXISTS public.deliverable_content_versions;

-- Note: The rest of the deliverable_content table and its policies remain unchanged