"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { PlusIcon, TrashIcon, PencilLine, Check, X } from "lucide-react";
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
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
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

  async function updateProject(projectId: string) {
    try {
      const { error } = await supabase
        .from("projects")
        .update({ name: editName, description: editDescription })
        .eq("id", projectId);

      if (error) throw error;
      setProjects((prevProjects) =>
        prevProjects.map((project) =>
          project.id === projectId
            ? { ...project, name: editName, description: editDescription }
            : project
        )
      );
      setEditingProjectId(null);
    } catch (error) {
      console.error("Error updating project:", error);
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
        <p className="flex flex-row space-x-3 items-center text-center">
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
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            variant="outline"
            className="flex items-center justify-center h-32"
            onClick={createProject}
          >
            <PlusIcon className="mr-2 h-4 w-4" /> New Project
          </Button>
          {projects.map((project: Project) => (
            <Card
              key={project.id}
              className="cursor-pointer hover:shadow-lg transition-shadow relative group"
            >
              {editingProjectId === project.id ? (
                <div className="p-4">
                  <div className="grid items-center gap-1.5">
                    <Label htmlFor="name" className="text-muted-foreground">
                      Project Name
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                  </div>
                  <div className="grid items-center gap-1.5">
                    <Label
                      htmlFor="description"
                      className="text-muted-foreground"
                    >
                      Project Description
                    </Label>
                    <Textarea
                      id="description"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end space-x-2 mt-2">
                    <Button
                      variant="secondary"
                      className="px-2 m-0 h-[2rem]"
                      onClick={() => updateProject(project.id)}
                    >
                      <Check className="h-4 w-4 mr-2" /> Save
                    </Button>
                    <Button
                      variant="destructive"
                      className="px-2 m-0 h-[2rem]"
                      onClick={() => setEditingProjectId(null)}
                    >
                      <X className="h-4 w-4 mr-2" /> Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="absolute hidden group-hover:flex w-[1.5rem] -right-[.5rem] top-[.5rem]">
                    <div className="flex flex-col space-y-1">
                      <Button
                        variant="outline"
                        className="w-[2rem] h-[2rem] p-0 m-0"
                        onClick={() => {
                          setEditingProjectId(project.id);
                          setEditName(project.name);
                          setEditDescription(project.description);
                        }}
                      >
                        <PencilLine className="h-4 w-4" />
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
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
