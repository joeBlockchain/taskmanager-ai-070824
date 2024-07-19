-- Create projects table
CREATE TABLE public.projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security for projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create policies for projects table
CREATE POLICY "Users can create their own projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own projects" ON public.projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON public.projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON public.projects
  FOR DELETE USING (auth.uid() = user_id);

-- Modify columns table to include project_id and position
ALTER TABLE public.columns
ADD COLUMN project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
ADD COLUMN position INTEGER NOT NULL;

-- Create a function to set up default columns for a new project
CREATE OR REPLACE FUNCTION setup_default_project_columns()
RETURNS TRIGGER AS $$
DECLARE
  column_names TEXT[] := ARRAY['To Do', 'In Progress', 'Review', 'Done'];
  i INTEGER;
BEGIN
  FOR i IN 1..array_length(column_names, 1) LOOP
    INSERT INTO public.columns (user_id, project_id, title, position)
    VALUES (NEW.user_id, NEW.id, column_names[i], i);
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to set up default columns when a new project is created
CREATE TRIGGER create_default_columns
AFTER INSERT ON public.projects
FOR EACH ROW EXECUTE FUNCTION setup_default_project_columns();

-- Update existing policies for columns table
DROP POLICY IF EXISTS "Users can view their own columns" ON public.columns;
CREATE POLICY "Users can view their project columns" ON public.columns
  FOR SELECT USING (auth.uid() = user_id);

-- Update existing policies for tasks table to include project check
DROP POLICY IF EXISTS "Users can view their own tasks" ON public.tasks;
CREATE POLICY "Users can view their project tasks" ON public.tasks
  FOR SELECT USING (auth.uid() = user_id AND column_id IN (SELECT id FROM public.columns WHERE project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())));

-- Add indexes for better performance
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_columns_project_id ON public.columns(project_id);

-- Add projects table to supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;