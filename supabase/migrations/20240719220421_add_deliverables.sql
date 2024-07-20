-- Create deliverables table
CREATE TABLE public.deliverables (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('Not Started', 'In Progress', 'Completed', 'Approved', 'Rejected')),
  due_date DATE,
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  is_archived BOOLEAN DEFAULT FALSE NOT NULL
);

-- Add primary_deliverable_id to tasks table
ALTER TABLE public.tasks
ADD COLUMN primary_deliverable_id UUID REFERENCES public.deliverables(id);

-- Enable Row Level Security for deliverables
ALTER TABLE public.deliverables ENABLE ROW LEVEL SECURITY;

-- Create policies for deliverables table
CREATE POLICY "Users can create their own deliverables" ON public.deliverables
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own deliverables" ON public.deliverables
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own deliverables" ON public.deliverables
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own deliverables" ON public.deliverables
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_deliverables_task_id ON public.deliverables(task_id);
CREATE INDEX idx_deliverables_user_id ON public.deliverables(user_id);
CREATE INDEX idx_tasks_primary_deliverable_id ON public.tasks(primary_deliverable_id);

-- Add trigger to update the updated_at column for deliverables
CREATE TRIGGER update_deliverables_modtime
BEFORE UPDATE ON public.deliverables
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Add deliverables table to supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.deliverables;

-- Create a function to ensure the primary_deliverable_id belongs to the task
CREATE OR REPLACE FUNCTION check_primary_deliverable()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.primary_deliverable_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.deliverables
      WHERE id = NEW.primary_deliverable_id AND task_id = NEW.id
    ) THEN
      RAISE EXCEPTION 'Primary deliverable must belong to the task';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to check primary_deliverable_id on tasks
CREATE TRIGGER check_primary_deliverable_trigger
BEFORE INSERT OR UPDATE OF primary_deliverable_id ON public.tasks
FOR EACH ROW EXECUTE FUNCTION check_primary_deliverable();