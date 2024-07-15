"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/utils/supabase/client";
import {
  AlignLeft,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Flag,
  GripVertical,
  PencilLine,
  Trash2,
} from "lucide-react";
import { useState, useEffect } from "react";

interface Task {
  id: string;
  title: string;
  description: string;
  column_id: string;
  priority: string;
  due_date: string;
}

interface Column {
  id: string;
  title: string;
  description: string;
}

export default function Kanban() {
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([fetchUser(), fetchColumns(), fetchTasks()])
      .then(() => setIsLoading(false))
      .catch((error) => {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      });

    const tasksSubscription = supabase
      .channel("schema-db-changes")
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
        { event: "*", schema: "public", table: "columns" },
        (payload) => {
          console.log("Column change received!", payload);
          handleColumnChange(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tasksSubscription);
    };
  }, []);

  async function fetchUser() {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      console.log("user", user);
      if (error) throw error;

      setUser(user);
    } catch (error) {
      console.error("Error fetching user:", error);
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

  async function addColumn() {
    try {
      const { error } = await supabase
        .from("columns")
        .insert({ title: "New Column", user_id: user.id });
      if (error) throw error;
    } catch (error) {
      console.error("Error adding column:", error);
    }
  }

  async function addTask(columnId: string) {
    try {
      const { error } = await supabase
        .from("tasks")
        .insert({ title: "New Task", column_id: columnId, user_id: user.id });
      if (error) throw error;
    } catch (error) {
      console.error("Error adding task:", error);
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
      switch (eventType) {
        case "INSERT":
          return [...prevTasks, newTask];
        case "UPDATE":
          return prevTasks.map((task) =>
            task.id === newTask.id ? newTask : task
          );
        case "DELETE":
          return prevTasks.filter((task) => task.id !== oldTask.id);
        default:
          return prevTasks;
      }
    });
  }

  return (
    <main className="p-4">
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="flex flex-row gap-4">
          {columns.map((column) => (
            <Card key={column.id} className="w-[22rem] h-fit">
              <CardHeader>
                <CardTitle className="">{column.title}</CardTitle>
                <CardDescription className="pb-2">
                  this is a description
                </CardDescription>
                <Separator className="" />
              </CardHeader>

              <CardContent>
                <div className="flex flex-col gap-4">
                  {tasks
                    .filter((task) => task.column_id === column.id)
                    .map((task) => (
                      <Card key={task.id} className="relative group p-0 m-0">
                        <Button
                          variant="outline"
                          className="absolute hidden group-hover:flex p-0 m-0 w-[1.5rem] -left-[.75rem] top-[.5rem]"
                        >
                          <GripVertical className="h-4 w-4" />
                        </Button>
                        <div className="absolute hidden group-hover:flex  w-[1.5rem] -right-[.5rem] top-[.5rem] ">
                          <div className="flex flex-col space-y-1">
                            <Button
                              variant="outline"
                              className="w-[2rem] h-[2rem] p-0 m-0"
                            >
                              <PencilLine className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              className="w-[2rem] h-[2rem] p-0 m-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <CardHeader className="px-6 py-2 m-0">
                          <CardTitle className="text-lg">
                            {task.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="px-6 pb-2 m-0 text-muted-foreground space-y-3">
                          <div className="flex items-center gap-3">
                            <AlignLeft className="h-4 w-4" />
                            <p>{task.description || "-"}</p>{" "}
                          </div>
                          <div className="flex items-center gap-3">
                            <Calendar className="h-4 w-4" />
                            <p>{task.due_date || "-"}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Flag className="h-4 w-4" />
                            {task.priority ? (
                              <Badge
                                className={
                                  task.priority === "urgent"
                                    ? "bg-red-700 text-red-200"
                                    : task.priority === "high"
                                    ? "bg-yellow-700 text-yellow-200"
                                    : task.priority === "medium"
                                    ? "bg-green-700 text-green-200"
                                    : "bg-gray-700 text-gray-200"
                                }
                              >
                                {task.priority}
                              </Badge>
                            ) : (
                              <div>-</div>
                            )}
                          </div>
                        </CardContent>

                        <CardFooter className="px-4 pb-2 m-0">
                          <Button
                            variant="outline"
                            className="absolute hidden group-hover:flex  w-[2rem] h-[2rem] p-0 m-0 left-[.5rem] -bottom-[1rem]"
                          >
                            <ArrowLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            className="absolute hidden group-hover:flex  w-[2rem] h-[2rem] p-0 m-0 right-[.5rem] -bottom-[1rem]"
                          >
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="secondary"
                  onClick={() => addTask(column.id)}
                  className="w-full text-muted-foreground"
                >
                  Add Task
                </Button>
              </CardFooter>
            </Card>
          ))}
          <div className="items-center h-fit ">
            <Button
              variant="secondary"
              onClick={addColumn}
              className="text-muted-foreground w-[22rem]"
            >
              Add Column
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
