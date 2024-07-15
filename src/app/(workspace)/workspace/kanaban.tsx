"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";
import { Column as ColumnType, Task as TaskType } from "./types";
import Column from "./column";
import {
  addColumn,
  addTask,
  deleteTask,
  updateTask,
  deleteColumn,
  updateColumn,
} from "./actions";

export default function Kanban() {
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [columns, setColumns] = useState<ColumnType[]>([]);
  const [tasks, setTasks] = useState<TaskType[]>([]);

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
        <div className="overflow-x-auto">
          <div className="flex flex-row gap-4 min-w-max">
            {columns.map((column) => (
              <Column
                key={column.id}
                column={column}
                tasks={tasks}
                addTask={(columnId) => addTask(columnId, user)}
                deleteTask={(taskId) => deleteTask(taskId, setTasks)}
                updateTask={(taskId, title, description) =>
                  updateTask(taskId, title, description, setTasks)
                }
                deleteColumn={(columnId) =>
                  deleteColumn(columnId, setColumns, setTasks)
                }
                updateColumn={(columnId, title, description) =>
                  updateColumn(columnId, title, description, setColumns)
                }
              />
            ))}
            <div className="items-center h-fit">
              <Button
                variant="outline"
                onClick={() => addColumn(user, "New Column")}
                className="text-muted-foreground w-[22rem]"
              >
                Add Column
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
