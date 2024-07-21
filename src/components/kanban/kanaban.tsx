"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { useState, useEffect, useContext } from "react";
import { Column as ColumnType, Task as TaskType, Project } from "./types";
import Column from "./column";
import {
  addColumn,
  addTask,
  moveTask,
  deleteTask,
  deleteColumn,
  updateColumn,
} from "./actions";
import { KanbanContext } from "@/components/kanban/kanban-wrapper";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface KanbanProps {
  projectId: string;
}

export default function Kanban({ projectId }: KanbanProps) {
  const supabase = createClient();
  const { columns, tasks, setColumns, setTasks } = useContext(KanbanContext);
  const [project, setProject] = useState<Project | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setIsLoading(true);
    fetchUser()
      .then(() => setIsLoading(false))
      .catch((error) => {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      });
    fetchProject();

    const subscription = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "projects" },
        (payload) => {
          console.log("Project change received!", payload);
          handleProjectChange(payload);
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "columns" },
        (payload) => {
          console.log("Column change received!", payload);
          handleColumnChange(payload);
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks" },
        (payload) => {
          console.log("Task change received!", payload);
          handleTaskChange(payload);
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "deliverables" },
        (payload) => {
          console.log("Deliverable change received!", payload);
          handleDeliverableChange(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [projectId]);

  async function fetchUser() {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) throw error;

      setUser(user);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  }

  async function fetchProject() {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();
      if (error) throw error;
      setProject(data);
    } catch (error) {
      console.error("Error fetching project:", error);
    }
  }

  async function fetchColumns() {
    try {
      const { data, error } = await supabase.from("columns").select("*");
      console.log("columns", data);
      if (error) throw error;
      setColumns(data);
    } catch (error) {
      console.error("Error fetching columns:", error);
    }
  }

  async function fetchTasks() {
    try {
      const { data, error } = await supabase.from("tasks").select("*");
      console.log("tasks", data);
      if (error) throw error;
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  }

  function handleProjectChange(payload: any) {
    const { eventType, new: newProject, old: oldProject } = payload;
    console.log("Project change received!", payload);

    if (eventType === "UPDATE" && newProject.id === projectId) {
      setProject(newProject);
    }
  }

  function handleColumnChange(payload: any) {
    const { eventType, new: newColumn, old: oldColumn } = payload;
    console.log("Column change received!", payload);
    setColumns((prevColumns) => {
      switch (eventType) {
        case "INSERT":
          return [...prevColumns, newColumn];
        case "UPDATE":
          return prevColumns.map((column) =>
            column.id === newColumn.id ? newColumn : column
          );
        case "DELETE":
          return prevColumns.filter((column) => column.id !== oldColumn.id);
        default:
          return prevColumns;
      }
    });
  }

  function handleTaskChange(payload: any) {
    const { eventType, new: newTask, old: oldTask } = payload;
    console.log("Task change received!", payload);
    setTasks((prevTasks) => {
      // Ensure prevTasks is an array
      const currentTasks = Array.isArray(prevTasks) ? prevTasks : [];
      switch (eventType) {
        case "INSERT":
          return [...currentTasks, newTask];
        case "UPDATE":
          return currentTasks.map((task) =>
            task.id === newTask.id ? { ...task, ...newTask } : task
          );
        case "DELETE":
          return currentTasks.filter((task) => task.id !== oldTask.id);
        default:
          return currentTasks;
      }
    });
  }

  function handleDeliverableChange(payload: any) {
    const { eventType, new: newDeliverable, old: oldDeliverable } = payload;
    console.log("Deliverable change received", payload);
    setTasks((prevTasks) => {
      return prevTasks.map((task) => {
        if (task.id === newDeliverable.task_id) {
          let updatedDeliverables = task.deliverables || [];
          switch (eventType) {
            case "INSERT":
              updatedDeliverables = [...updatedDeliverables, newDeliverable];
              break;
            case "UPDATE":
              updatedDeliverables = updatedDeliverables.map((deliverable) =>
                deliverable.id === newDeliverable.id
                  ? newDeliverable
                  : deliverable
              );
              break;
            case "DELETE":
              updatedDeliverables = updatedDeliverables.filter(
                (deliverable) => deliverable.id !== oldDeliverable.id
              );
              break;
          }
          return { ...task, deliverables: updatedDeliverables };
        }
        return task;
      });
    });
  }

  return (
    <div>
      <div className="flex flex-row items-center justify-between my-4">
        <div className="flex flex-row items-center text-center space-x-4">
          <Link
            href={`/workspace/projects`}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>All Projects</span>
          </Link>
          <h1 className="text-2xl font-bold text-center">
            {project ? project.name : "Loading..."}:
          </h1>
          <h1 className="text-xl text-center text-muted-foreground">
            {project ? project.description : "Loading..."}
          </h1>
        </div>
      </div>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <div className="flex flex-row gap-4 min-w-max">
            {columns.map((column) => (
              <Column
                key={column.id}
                column={column}
                columns={columns}
                tasks={tasks}
                setTasks={setTasks}
                addTask={(columnId) => addTask(columnId, user, setTasks)}
                deleteTask={(taskId) => deleteTask(taskId, setTasks)}
                moveTask={(taskId, newColumnId) =>
                  moveTask(taskId, newColumnId, setTasks)
                }
                deleteColumn={(columnId) =>
                  deleteColumn(columnId, setColumns, setTasks)
                }
                updateColumn={(columnId, title, description) =>
                  updateColumn(columnId, title, description, setColumns)
                }
              />
            ))}
            {/* <div className="items-center h-fit">
              <Button
                variant="outline"
                onClick={() => addColumn(user, "New Column")}
                className="text-muted-foreground w-[22rem]"
              >
                Add Column
              </Button>
            </div> */}
          </div>
        </div>
      )}
    </div>
  );
}
