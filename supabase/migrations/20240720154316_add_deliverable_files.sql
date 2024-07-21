-- Create deliverable_content table
CREATE TABLE public.deliverable_content (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  deliverable_id UUID REFERENCES public.deliverables(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add a unique constraint to ensure one-to-one relationship
ALTER TABLE public.deliverable_content
ADD CONSTRAINT unique_deliverable_content UNIQUE (deliverable_id);

-- Enable Row Level Security for deliverable_content
ALTER TABLE public.deliverable_content ENABLE ROW LEVEL SECURITY;

-- Create policies for deliverable_content table
CREATE POLICY "Users can create content for their own deliverables" ON public.deliverable_content
  FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM public.deliverables WHERE id = deliverable_content.deliverable_id));

CREATE POLICY "Users can view content of their own deliverables" ON public.deliverable_content
  FOR SELECT USING (auth.uid() IN (SELECT user_id FROM public.deliverables WHERE id = deliverable_content.deliverable_id));

CREATE POLICY "Users can update content of their own deliverables" ON public.deliverable_content
  FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM public.deliverables WHERE id = deliverable_content.deliverable_id));

CREATE POLICY "Users can delete content of their own deliverables" ON public.deliverable_content
  FOR DELETE USING (auth.uid() IN (SELECT user_id FROM public.deliverables WHERE id = deliverable_content.deliverable_id));

-- Create index for better performance
CREATE INDEX idx_deliverable_content_deliverable_id ON public.deliverable_content(deliverable_id);

-- Add trigger to update the updated_at column for deliverable_content
CREATE TRIGGER update_deliverable_content_modtime
BEFORE UPDATE ON public.deliverable_content
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Add deliverable_content table to supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.deliverable_content;

-- Create a function to version markdown content
CREATE TABLE public.deliverable_content_versions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  deliverable_content_id UUID REFERENCES public.deliverable_content(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE OR REPLACE FUNCTION version_markdown_content()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.content IS DISTINCT FROM NEW.content THEN
    INSERT INTO public.deliverable_content_versions (deliverable_content_id, content, created_by)
    VALUES (NEW.id, NEW.content, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER version_markdown_content_trigger
AFTER UPDATE ON public.deliverable_content
FOR EACH ROW EXECUTE FUNCTION version_markdown_content();

-- Add policy for version access
CREATE POLICY "Users can view versions of their own deliverable content" ON public.deliverable_content_versions
  FOR SELECT USING (auth.uid() IN (SELECT user_id FROM public.deliverables WHERE id = (SELECT deliverable_id FROM public.deliverable_content WHERE id = deliverable_content_versions.deliverable_content_id)));