"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  PlusIcon,
  TrashIcon,
  PencilLine,
  Check,
  X,
  Kanban,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { ExternalLink } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    setIsLoading(true);
    Promise.all([fetchUser(), fetchProjects()])
      .then(() => setIsLoading(false))
      .catch((error) => {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      });

    const projectsSubscription = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "projects" },
        (payload) => {
          console.log("Project change received!", payload);
          handleProjectChange(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(projectsSubscription);
    };
  }, []);

  async function fetchUser() {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) throw error;

      setUser(user);
    } catch (error) {
      console.log("Error fetching user:", error);
      console.error("Error fetching user:", error);
    }
  }

  async function fetchProjects() {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  }

  async function createProject() {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("projects")
        .insert([
          {
            name: "New Project",
            description: "Project Description",
            user_id: user.id,
          },
        ])
        .select();

      if (error) throw error;
    } catch (error) {
      console.log("Error creating project:", error);
      console.error("Error creating project:", error);
    }
  }

  async function deleteProject(projectId: string) {
    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId);

      if (error) throw error;
      setProjects((prevProjects) =>
        prevProjects.filter((project) => project.id !== projectId)
      );
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  }

  function handleProjectChange(payload: any) {
    const { eventType, new: newProject, old: oldProject } = payload;
    setProjects((prevProjects) => {
      switch (eventType) {
        case "INSERT":
          return [...prevProjects, newProject];
        case "UPDATE":
          return prevProjects.map((project) =>
            project.id === newProject.id ? newProject : project
          );
        case "DELETE":
          return prevProjects.filter((project) => project.id !== oldProject.id);
        default:
          return prevProjects;
      }
    });
  }

  return (
    <div className=" mx-auto">
      {isLoading ? (
        <div className="flex flex-row space-x-3 items-center text-center">
          <span
            className="loader"
            style={
              {
                "--loader-size": "18px",
                "--loader-color": "#000",
                "--loader-color-dark": "#fff",
              } as React.CSSProperties
            }
          ></span>
          <span>Loading...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            className="flex items-center justify-center h-[9rem] text-muted-foreground bg-secondary/80 hover:bg-secondary/60 border border-primary/20"
            onClick={createProject}
          >
            <Kanban className="mr-2 " />
            <h3 className="text-xl leading-none tracking-tight">New Project</h3>
          </Button>
          {projects.map((project: Project) => (
            <Card
              key={project.id}
              className="cursor-pointer hover:shadow-lg transition-shadow relative group"
            >
              <>
                <div className="absolute hidden group-hover:flex w-[1.5rem] -right-[.5rem] top-[.5rem]">
                  <div className="flex flex-col space-y-1">
                    <Button
                      variant="outline"
                      className="w-[2rem] h-[2rem] p-0 m-0"
                      asChild
                    >
                      <Link href={`/workspace/projects/board/${project.id}`}>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="w-[2rem] h-[2rem] p-0 m-0"
                      onClick={() => deleteProject(project.id)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Link href={`/workspace/projects/board/${project.id}`}>
                  <CardHeader>
                    <CardTitle>{project.name}</CardTitle>
                    <CardDescription>
                      Created:{" "}
                      {new Date(project.created_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>{project.description}</CardContent>
                  {/* <CardFooter className="flex justify-end">
                      
                    </CardFooter> */}
                </Link>
              </>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
