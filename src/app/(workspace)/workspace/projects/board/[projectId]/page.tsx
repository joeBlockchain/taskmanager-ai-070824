import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import KanbanWrapper from "@/components/kanban/kanban-wrapper";
import {
  Column as ColumnType,
  Task as TaskType,
  Deliverable as DeliverableType,
} from "@/components/kanban/types";

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

  const { data: deliverables, error: deliverablesError } = await supabase
    .from("deliverables")
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

  return (
    <div className="">
      <KanbanWrapper
        projectId={params.projectId}
        initialColumns={columns as ColumnType[]}
        initialTasks={tasks as TaskType[]}
        initialDeliverables={deliverables as DeliverableType[]}
      />
    </div>
  );
}
