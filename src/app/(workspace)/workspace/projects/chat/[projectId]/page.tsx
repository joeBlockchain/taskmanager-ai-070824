import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Chat from "@/components/chat/chat";

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

  console.log("params", params); // Log the params object

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

  if (projectError || !project) {
    notFound();
  }

  return (
    <div className="mx-auto">
      <h1 className="text-2xl font-bold mb-4">{project.name}</h1>
      <p className="text-sm text-muted-foreground">
        Created: {new Date(project.created_at).toLocaleDateString()}
      </p>
      <p className="text-sm text-muted-foreground">
        projectID {params.projectId}
      </p>
      <div className="h-screen">
        <Chat projectId={params.projectId} />
      </div>
    </div>
  );
}
