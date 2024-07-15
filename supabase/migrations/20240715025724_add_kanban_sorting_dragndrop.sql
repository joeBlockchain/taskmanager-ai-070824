-- Add order column to columns table
ALTER TABLE public.columns ADD COLUMN order_index INT;

-- Add order column to tasks table
ALTER TABLE public.tasks ADD COLUMN order_index INT;

-- Update order for existing columns
UPDATE public.columns
SET order_index = subquery.row_num
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) as row_num
  FROM public.columns
) AS subquery
WHERE columns.id = subquery.id;

-- Update order for existing tasks
UPDATE public.tasks
SET order_index = subquery.row_num
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY column_id ORDER BY created_at) as row_num
  FROM public.tasks
) AS subquery
WHERE tasks.id = subquery.id;

-- Create unique constraint to ensure order is always unique per user/column
ALTER TABLE public.columns ADD CONSTRAINT unique_column_order UNIQUE (user_id, order_index);
ALTER TABLE public.tasks ADD CONSTRAINT unique_task_order UNIQUE (column_id, order_index);

-- Function to reorder tasks when one is moved
CREATE OR REPLACE FUNCTION reorder_tasks()
RETURNS TRIGGER AS $$
BEGIN
  -- If the task's column has changed, update order in both old and new columns
  IF OLD.column_id != NEW.column_id THEN
    -- Decrease order of tasks in the old column
    UPDATE public.tasks
    SET order_index = order_index - 1
    WHERE column_id = OLD.column_id
      AND order_index > OLD.order_index;
    
    -- Increase order of tasks in the new column to make space
    UPDATE public.tasks
    SET order_index = order_index + 1
    WHERE column_id = NEW.column_id
      AND order_index >= NEW.order_index;
  ELSE
    -- If moving within the same column
    IF OLD.order_index < NEW.order_index THEN
      -- Moving down: decrease order of tasks in between
      UPDATE public.tasks
      SET order_index = order_index - 1
      WHERE column_id = NEW.column_id
        AND order_index > OLD.order_index
        AND order_index <= NEW.order_index;
    ELSE
      -- Moving up: increase order of tasks in between
      UPDATE public.tasks
      SET order_index = order_index + 1
      WHERE column_id = NEW.column_id
        AND order_index < OLD.order_index
        AND order_index >= NEW.order_index;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER task_reorder_trigger
BEFORE UPDATE ON public.tasks
FOR EACH ROW
WHEN (OLD.order_index IS DISTINCT FROM NEW.order_index OR OLD.column_id IS DISTINCT FROM NEW.column_id)
EXECUTE FUNCTION reorder_tasks();