import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function createColumn(title: string, userId: string) {
  const { data, error } = await supabase
    .from("columns")
    .insert({ title, user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateColumn(columnId: string, newTitle: string) {
  const { data, error } = await supabase
    .from("columns")
    .update({ title: newTitle })
    .eq("id", columnId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteColumn(columnId: string) {
  const { error } = await supabase.from("columns").delete().eq("id", columnId);

  if (error) throw error;
  return true;
}

export async function createTask(
  columnId: string,
  title: string,
  content: string,
  userId: string
) {
  const { data, error } = await supabase
    .from("tasks")
    .insert({ column_id: columnId, title, content, user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTask(
  taskId: string,
  newTitle: string,
  newContent: string
) {
  const { data, error } = await supabase
    .from("tasks")
    .update({ title: newTitle, content: newContent })
    .eq("id", taskId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTask(taskId: string) {
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);

  if (error) throw error;
  return true;
}
