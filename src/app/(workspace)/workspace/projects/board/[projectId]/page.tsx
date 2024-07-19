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

  const { data: tasks, error: tasksError } = await supabase
    .from("tasks")
    .select("*")
    .eq("project_id", params.projectId);

  if (projectError || !project) {
    notFound();
  }

  return (
    <div className="mx-auto">
      <div className="flex flex-row items-center justify-between my-4">
        <div className="flex flex-row items-center text-center space-x-4">
          <Link
            href={`/workspace/projects`}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>All Projects</span>
          </Link>

          <h1 className="text-2xl font-bold text-center">{project.name}</h1>
        </div>
      </div>

      <KanbanWrapper
        projectId={params.projectId}
        initialColumns={columns as ColumnType[]}
        initialTasks={tasks as TaskType[]}
      />
    </div>
  );
}
