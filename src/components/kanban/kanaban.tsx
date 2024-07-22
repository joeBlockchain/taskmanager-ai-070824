"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { useState, useEffect, useContext } from "react";
import {
  Column as ColumnType,
  Task as TaskType,
  Project,
  Deliverable as DeliverableType,
} from "./types";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface KanbanProps {
  projectId: string;
}

export default function Kanban({ projectId }: KanbanProps) {
  const supabase = createClient();
  const {
    columns,
    tasks,
    setColumns,
    setTasks,
    deliverables,
    setDeliverables,
  } = useContext(KanbanContext);
  const [project, setProject] = useState<Project | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setIsLoading(true);
    fetchUser()
      .then(() => fetchProject())
      .catch((error) => {
        console.error("Error fetching data:", error);
      })
      .finally(() => setIsLoading(false));

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
      // After successfully fetching the project, fetch the columns
      await fetchColumns();
    } catch (error) {
      console.error("Error fetching project:", error);
      setIsLoading(false);
    }
  }

  async function fetchColumns() {
    try {
      const { data, error } = await supabase
        .from("columns")
        .select("*")
        .eq("project_id", projectId);
      if (error) throw error;
      setColumns(data);
      // After fetching columns, fetch tasks for these columns
      await fetchTasks(data.map((column) => column.id));
    } catch (error) {
      console.error("Error fetching columns:", error);
    }
  }

  async function fetchTasks(columnIds: string[]) {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .in("column_id", columnIds);
      if (error) throw error;
      setTasks(data);
      // After fetching tasks, fetch deliverables for these tasks
      fetchDeliverables(data.map((task) => task.id));
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  }

  async function fetchDeliverables(taskIds: string[]) {
    try {
      const { data, error } = await supabase
        .from("deliverables")
        .select("*")
        .in("task_id", taskIds);
      if (error) throw error;
      setDeliverables(data);
    } catch (error) {
      console.error("Error fetching deliverables:", error);
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
    setDeliverables((prevDeliverables) => {
      // Ensure prevTasks is an array
      const currentDeliverables = Array.isArray(prevDeliverables)
        ? prevDeliverables
        : [];
      switch (eventType) {
        case "INSERT":
          return [...currentDeliverables, newDeliverable];
        case "UPDATE":
          return currentDeliverables.map((deliverable) =>
            deliverable.id === newDeliverable.id
              ? { ...deliverable, ...newDeliverable }
              : deliverable
          );
        case "DELETE":
          return currentDeliverables.filter(
            (deliverable) => deliverable.id !== oldDeliverable.id
          );
        default:
          return currentDeliverables;
      }
    });
  }

  // Helper function to group columns into pairs
  const groupColumnPairs = (columns: ColumnType[]) => {
    return columns.reduce((result, column, index) => {
      if (index % 2 === 0) {
        result.push([column]);
      } else {
        result[result.length - 1].push(column);
      }
      return result;
    }, [] as ColumnType[][]);
  };

  const columnPairs = groupColumnPairs(columns);

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
            {project ? project.name : "Loading..."}
          </h1>
        </div>
      </div>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="w-full">
          {/* Tabs for small screens */}
          <div className="md:hidden">
            <Tabs defaultValue={columns[0]?.id} className="w-full">
              <TabsList className="w-full justify-between">
                {columns.map((column) => (
                  <TabsTrigger
                    key={column.id}
                    value={column.id}
                    className="w-full"
                  >
                    {column.title}
                  </TabsTrigger>
                ))}
              </TabsList>
              {columns.map((column) => (
                <TabsContent key={column.id} value={column.id}>
                  <Column
                    column={column}
                    columns={columns}
                    tasks={tasks}
                    setTasks={setTasks}
                    deliverables={deliverables}
                    setDeliverables={setDeliverables}
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
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* Side-by-side 2 columns for md screens */}
          <div className="hidden md:block lg:hidden">
            <Tabs defaultValue="first-2" className="w-full">
              <TabsList className="w-full justify-between">
                <TabsTrigger className="w-full" value="first-2">
                  Todo & In Progress
                </TabsTrigger>
                <TabsTrigger className="w-full" value="last-2">
                  Review & Done
                </TabsTrigger>
              </TabsList>
              <TabsContent value="first-2">
                <div className="flex space-x-4">
                  {columns.slice(0, 2).map((column) => (
                    <div key={column.id} className="flex-1 min-w-[300px]">
                      <Column
                        column={column}
                        columns={columns}
                        tasks={tasks}
                        setTasks={setTasks}
                        deliverables={deliverables}
                        setDeliverables={setDeliverables}
                        addTask={(columnId) =>
                          addTask(columnId, user, setTasks)
                        }
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
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="last-2">
                <div className="flex space-x-4">
                  {columns.slice(2, 4).map((column) => (
                    <div key={column.id} className="flex-1 min-w-[300px]">
                      <Column
                        column={column}
                        columns={columns}
                        tasks={tasks}
                        setTasks={setTasks}
                        deliverables={deliverables}
                        setDeliverables={setDeliverables}
                        addTask={(columnId) =>
                          addTask(columnId, user, setTasks)
                        }
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
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Side-by-side columns for large screens */}
          <div className="hidden lg:flex lg:space-x-4 lg:overflow-x-auto">
            {columns.map((column) => (
              <div key={column.id} className="lg:flex-1 lg:min-w-[300px]">
                <Column
                  column={column}
                  columns={columns}
                  tasks={tasks}
                  setTasks={setTasks}
                  deliverables={deliverables}
                  setDeliverables={setDeliverables}
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
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
