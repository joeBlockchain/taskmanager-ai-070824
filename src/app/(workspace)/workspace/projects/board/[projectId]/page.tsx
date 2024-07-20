import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import KanbanWrapper from "@/components/kanban/kanban-wrapper";
import {
  Column as ColumnType,
  Task as TaskType,
} from "@/components/kanban/types";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Project {
  id: string;
  name: string;
  created_at: string;
}

interface ProjectPageProps {
  params: {
    projectId: string;
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>You are not logged in</div>;
  }

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", params.projectId)
    .single();

  const { data: columns, error: columnsError } = await supabase
    .from("columns")
    .select("*")
    .eq("project_id", params.projectId);

  if (projectError || !project) {
    notFound();
  }

  const tasksPromises =
    columns?.map(async (column: ColumnType) => {
      const { data: tasks, error: tasksError } = await supabase
        .from("tasks")
        .select("*")
        .eq("column_id", column.id);

      if (tasksError) {
        console.error(
          `Error fetching tasks for column ${column.id}:`,
          tasksError
        );
        return [];
      }

      return tasks;
    }) ?? [];

  const tasksArray = await Promise.all(tasksPromises);
  const tasks = tasksArray.flat();

  console.log("columns", columns);
  console.log("tasks", tasks);

  return (
    <div className="mx-auto">
      <KanbanWrapper
        projectId={params.projectId}
        initialColumns={columns as ColumnType[]}
        initialTasks={tasks as TaskType[]}
      />
    </div>
  );
}
