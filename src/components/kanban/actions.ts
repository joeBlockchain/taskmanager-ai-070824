import { createClient } from "@/utils/supabase/client";
import {
  Column as ColumnType,
  Task as TaskType,
} from "@/components/kanban/types";

const supabase = createClient();

export async function addColumn(user: any, title: string) {
  try {
    const { data, error } = await supabase
      .from("columns")
      .insert({ title, user_id: user.id })
      .select()

      console.log("data", data);
    if (error) throw error;
  } catch (error) {
    console.error("Error adding column:", error);
  }
}

export async function addTask(columnId: string, user: any) {
  try {
    const { data, error } = await supabase
      .from("tasks")
      .insert({ title: "New Task", column_id: columnId, user_id: user.id })
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error adding task:", error);
    return null;
  }
}

export async function deleteTask(
  taskId: string,
  setTasks: React.Dispatch<React.SetStateAction<TaskType[]>>
) {
  try {
    const { error } = await supabase.from("tasks").delete().eq("id", taskId);

    if (error) throw error;

    // Optimistically update the UI
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  } catch (error) {
    console.error("Error deleting task:", error);
  }
}

export async function updateTask(
  taskId: string,
  title: string,
  description: string,
  setTasks: React.Dispatch<React.SetStateAction<TaskType[]>>
) {
  try {
    const { error } = await supabase
      .from("tasks")
      .update({ title, description })
      .eq("id", taskId);

    if (error) throw error;

    // Optimistically update the UI
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, title, description } : task
      )
    );
  } catch (error) {
    console.error("Error updating task:", error);
  }
}

export async function moveTask(
  taskId: string,
  newColumnId: string,
  setTasks: React.Dispatch<React.SetStateAction<TaskType[]>>
) {
  try {
    const { error } = await supabase
      .from("tasks")
      .update({ column_id: newColumnId })
      .eq("id", taskId);

    if (error) throw error;

    // Optimistically update the UI
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, column_id: newColumnId } : task
      )
    );
  } catch (error) {
    console.error("Error moving task:", error);
  }
}

export async function deleteColumn(
  columnId: string,
  setColumns: React.Dispatch<React.SetStateAction<ColumnType[]>>,
  setTasks: React.Dispatch<React.SetStateAction<TaskType[]>>
) {
  try {
    // First, delete all tasks associated with this column
    const { error: tasksError } = await supabase
      .from("tasks")
      .delete()
      .eq("column_id", columnId);

    if (tasksError) throw tasksError;

    // Then, delete the column itself
    const { error: columnError } = await supabase
      .from("columns")
      .delete()
      .eq("id", columnId);

    if (columnError) throw columnError;

    // Optimistically update the UI
    setColumns((prevColumns) =>
      prevColumns.filter((column) => column.id !== columnId)
    );
    setTasks((prevTasks) =>
      prevTasks.filter((task) => task.column_id !== columnId)
    );
  } catch (error) {
    console.error("Error deleting column:", error);
  }
}

export async function updateColumn(
  columnId: string,
  title: string,
  description: string,
  setColumns: React.Dispatch<React.SetStateAction<ColumnType[]>>
) {
  try {
    const { error } = await supabase
      .from("columns")
      .update({ title, description })
      .eq("id", columnId);

    if (error) throw error;

    // Optimistically update the UI
    setColumns((prevColumns) =>
      prevColumns.map((column) =>
        column.id === columnId ? { ...column, title, description } : column
      )
    );
  } catch (error) {
    console.error("Error updating column:", error);
  }
}
export async function addDeliverable(taskId: string, userId: string, title: string, status: string, description?: string, dueDate?: string) {
  console.log("taskId:", taskId);
  console.log("user:", userId);
  console.log("title:", title);
  console.log("status:", status);
  console.log("description:", description);
  console.log("dueDate:", dueDate);
  try {
    const { data, error } = await supabase
      .from("deliverables")
      .insert({
        task_id: taskId,
        user_id: userId,
        title,
        status,
        description,
        due_date: dueDate,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_archived: false
      })
      .select();


console.log("data:", data)
console.log("error:", error)

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.log(error)
    console.error("Error adding deliverable:", error);
    return null;
  }
}