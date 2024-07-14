"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@supabase/supabase-js";
import {
  createColumn,
  updateColumn as updateColumnInDB,
  deleteColumn as deleteColumnInDB,
  createTask as createTaskInDB,
  updateTask as updateTaskInDB,
  deleteTask as deleteTaskInDB,
} from "./tools";

import { BoardColumn, BoardContainer } from "./BoardColumn";
import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  useSensor,
  useSensors,
  KeyboardSensor,
  Announcements,
  UniqueIdentifier,
  TouchSensor,
  MouseSensor,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { TaskCard } from "./TaskCard";

import { hasDraggableData } from "./utils";
import { coordinateGetter } from "./multipleContainersKeyboardPreset";
import { Button } from "../ui/button";
import { PlusIcon } from "lucide-react";

import { defaultCols, initialTasks } from "./defaultData";

import { type Task, type Column } from "./types";
export type ColumnId = (typeof defaultCols)[number]["id"];

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function KanbanBoard({ userId }: { userId: string }) {
  const [columns, setColumns] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      setIsLoading(true);
      Promise.all([fetchColumns(), fetchTasks()])
        .then(() => setIsLoading(false))
        .catch((error) => {
          console.error("Error fetching data:", error);
          setIsLoading(false);
        });
    }
  }, [userId]);

  async function fetchColumns() {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from("columns")
        .select("*")
        .eq("user_id", userId);

      if (error) throw error;

      const formattedColumns = data.map((column: any) => ({
        id: column.id,
        title: column.title,
      }));
      setColumns(formattedColumns);
    } catch (error) {
      console.error("Error fetching columns:", error);
    }
  }

  async function fetchTasks() {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", userId);

      if (error) throw error;

      const formattedTasks = data.map((task: any) => ({
        id: task.id,
        columnId: task.column_id,
        title: task.title,
        content: task.content,
      }));
      setTasks(formattedTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  }

  useEffect(() => {
    if (!userId) return;

    const columnsSubscription = supabase
      .channel("custom-all-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "columns",
          filter: `user_id=eq.${userId}`,
        },
        fetchColumns
      )
      .subscribe();

    const tasksSubscription = supabase
      .channel("custom-all-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
          filter: `user_id=eq.${userId}`,
        },
        fetchTasks
      )
      .subscribe();

    return () => {
      supabase.removeChannel(columnsSubscription);
      supabase.removeChannel(tasksSubscription);
    };
  }, [userId]);

  const addColumn = async () => {
    if (!userId) {
      console.error("User not authenticated");
      return;
    }
    try {
      const newColumn = await createColumn(
        `New Column ${columns.length + 1}`,
        userId
      );
      setColumns([...columns, newColumn]);
    } catch (error) {
      console.error("Error creating column:", error);
    }
  };

  const addTask = async (columnId: UniqueIdentifier) => {
    if (!userId) {
      console.error("User not authenticated");
      return;
    }
    try {
      const newTask = await createTaskInDB(
        columnId as string,
        `New Task ${tasks.length + 1}`,
        `Content for New Task ${tasks.length + 1}`,
        userId
      );
      setTasks([...tasks, newTask]);
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const pickedUpTaskColumn = useRef<ColumnId | null>(null);
  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

  const [activeColumn, setActiveColumn] = useState<Column | null>(null);

  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: coordinateGetter,
    })
  );

  function getDraggingTaskData(taskId: UniqueIdentifier, columnId: ColumnId) {
    const tasksInColumn = tasks.filter((task) => task.columnId === columnId);
    const taskPosition = tasksInColumn.findIndex((task) => task.id === taskId);
    const column = columns.find((col) => col.id === columnId);
    return {
      tasksInColumn,
      taskPosition,
      column,
    };
  }

  const announcements: Announcements = {
    onDragStart({ active }) {
      if (!hasDraggableData(active)) return;
      if (active.data.current?.type === "Column") {
        const startColumnIdx = columnsId.findIndex((id) => id === active.id);
        const startColumn = columns[startColumnIdx];
        return `Picked up Column ${startColumn?.title} at position: ${
          startColumnIdx + 1
        } of ${columnsId.length}`;
      } else if (active.data.current?.type === "Task") {
        pickedUpTaskColumn.current = active.data.current.task.columnId;
        const { tasksInColumn, taskPosition, column } = getDraggingTaskData(
          active.id,
          pickedUpTaskColumn.current ?? active.data.current.task.columnId
        );
        return `Picked up Task ${
          active.data.current.task.content
        } at position: ${taskPosition + 1} of ${
          tasksInColumn.length
        } in column ${column?.title}`;
      }
    },
    onDragOver({ active, over }) {
      if (!hasDraggableData(active) || !hasDraggableData(over)) return;

      if (
        active.data.current?.type === "Column" &&
        over.data.current?.type === "Column"
      ) {
        const overColumnIdx = columnsId.findIndex((id) => id === over.id);
        return `Column ${active.data.current.column.title} was moved over ${
          over.data.current.column.title
        } at position ${overColumnIdx + 1} of ${columnsId.length}`;
      } else if (
        active.data.current?.type === "Task" &&
        over.data.current?.type === "Task"
      ) {
        const { tasksInColumn, taskPosition, column } = getDraggingTaskData(
          over.id,
          over.data.current.task.columnId
        );
        if (over.data.current.task.columnId !== pickedUpTaskColumn.current) {
          return `Task ${
            active.data.current.task.content
          } was moved over column ${column?.title} in position ${
            taskPosition + 1
          } of ${tasksInColumn.length}`;
        }
        return `Task was moved over position ${taskPosition + 1} of ${
          tasksInColumn.length
        } in column ${column?.title}`;
      }
    },
    onDragEnd({ active, over }) {
      if (!hasDraggableData(active) || !hasDraggableData(over)) {
        pickedUpTaskColumn.current = null;
        return;
      }
      if (
        active.data.current?.type === "Column" &&
        over.data.current?.type === "Column"
      ) {
        const overColumnPosition = columnsId.findIndex((id) => id === over.id);

        return `Column ${
          active.data.current.column.title
        } was dropped into position ${overColumnPosition + 1} of ${
          columnsId.length
        }`;
      } else if (
        active.data.current?.type === "Task" &&
        over.data.current?.type === "Task"
      ) {
        const { tasksInColumn, taskPosition, column } = getDraggingTaskData(
          over.id,
          over.data.current.task.columnId
        );
        if (over.data.current.task.columnId !== pickedUpTaskColumn.current) {
          return `Task was dropped into column ${column?.title} in position ${
            taskPosition + 1
          } of ${tasksInColumn.length}`;
        }
        return `Task was dropped into position ${taskPosition + 1} of ${
          tasksInColumn.length
        } in column ${column?.title}`;
      }
      pickedUpTaskColumn.current = null;
    },
    onDragCancel({ active }) {
      pickedUpTaskColumn.current = null;
      if (!hasDraggableData(active)) return;
      return `Dragging ${active.data.current?.type} cancelled.`;
    },
  };

  const updateColumn = async (columnId: UniqueIdentifier, newTitle: string) => {
    try {
      const updatedColumn = await updateColumnInDB(
        columnId as string,
        newTitle
      );
      setColumns(
        columns.map((col) => (col.id === columnId ? updatedColumn : col))
      );
    } catch (error) {
      console.error("Error updating column:", error);
    }
  };

  const deleteColumn = async (
    columnId: UniqueIdentifier,
    tasksToDelete: Task[]
  ) => {
    try {
      await deleteColumnInDB(columnId as string);
      setColumns(columns.filter((col) => col.id !== columnId));
      setTasks(
        tasks.filter((task) => !tasksToDelete.some((t) => t.id === task.id))
      );
    } catch (error) {
      console.error("Error deleting column:", error);
    }
  };

  const updateTask = async (
    taskId: UniqueIdentifier,
    updatedTask: Partial<Task>
  ) => {
    try {
      const updated = await updateTaskInDB(
        taskId as string,
        updatedTask.title || "",
        updatedTask.content || ""
      );
      setTasks(
        tasks.map((task) =>
          task.id === taskId ? { ...task, ...updated } : task
        )
      );
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const deleteTask = async (taskId: UniqueIdentifier) => {
    try {
      await deleteTaskInDB(taskId as string);
      setTasks(tasks.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const bumpTask = (taskId: UniqueIdentifier, direction: "left" | "right") => {
    setTasks((prevTasks) => {
      const taskIndex = prevTasks.findIndex((task) => task.id === taskId);
      if (taskIndex === -1) return prevTasks;

      const task = prevTasks[taskIndex];
      const currentColumnIndex = columns.findIndex(
        (col) => col.id === task.columnId
      );

      if (
        (direction === "left" && currentColumnIndex === 0) ||
        (direction === "right" && currentColumnIndex === columns.length - 1)
      ) {
        return prevTasks;
      }

      const newColumnId =
        columns[currentColumnIndex + (direction === "left" ? -1 : 1)].id;

      // Remove the task from its current position
      const updatedTasks = prevTasks.filter((t) => t.id !== taskId);

      // Create the updated task with the new column ID
      const updatedTask = { ...task, columnId: newColumnId as ColumnId };

      // Find the index to insert the task at the top of the new column
      const insertIndex = updatedTasks.findIndex(
        (t) => t.columnId === newColumnId
      );

      // Insert the task at the found index (or at the beginning if no tasks in the column)
      if (insertIndex === -1) {
        updatedTasks.push(updatedTask);
      } else {
        updatedTasks.splice(insertIndex, 0, updatedTask);
      }

      return updatedTasks;
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="">
      <DndContext
        accessibility={{
          announcements,
        }}
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
      >
        <BoardContainer>
          <SortableContext items={columnsId}>
            {columns.map((col, index) => (
              <BoardColumn
                key={col.id}
                column={col}
                tasks={tasks.filter((task) => task.columnId === col.id)}
                onAddTask={addTask}
                onDeleteTask={deleteTask}
                onUpdateTask={updateTask}
                onDeleteColumn={deleteColumn}
                onUpdateColumn={updateColumn}
                onBumpTask={bumpTask}
                isLeftmostColumn={index === 0}
                isRightmostColumn={index === columns.length - 1}
              />
            ))}
          </SortableContext>
          <Button
            onClick={addColumn}
            className="w-[350px] h-[65px] justify-start"
            variant="outline"
          >
            <PlusIcon className="mr-2 h-4 " />
            <span className="text-base">Add Column</span>
          </Button>
        </BoardContainer>

        {"document" in window &&
          createPortal(
            <DragOverlay>
              {activeColumn && (
                <BoardColumn
                  isOverlay
                  column={activeColumn}
                  tasks={tasks.filter(
                    (task) => task.columnId === activeColumn.id
                  )}
                  onAddTask={addTask}
                  onDeleteTask={deleteTask}
                  onDeleteColumn={deleteColumn}
                  onUpdateColumn={updateColumn}
                  onUpdateTask={updateTask}
                  onBumpTask={bumpTask}
                  isLeftmostColumn={false}
                  isRightmostColumn={false}
                />
              )}
              {activeTask && (
                <TaskCard
                  task={activeTask}
                  isOverlay
                  onDelete={deleteTask}
                  onUpdate={updateTask}
                  onBump={bumpTask}
                  isLeftmostColumn={false}
                  isRightmostColumn={false}
                />
              )}
            </DragOverlay>,
            document.body
          )}
      </DndContext>
    </div>
  );

  function onDragStart(event: DragStartEvent) {
    if (!hasDraggableData(event.active)) return;
    const data = event.active.data.current;
    if (data?.type === "Column") {
      setActiveColumn(data.column);
      return;
    }

    if (data?.type === "Task") {
      setActiveTask(data.task);
      return;
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveColumn(null);
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (!hasDraggableData(active)) return;

    const activeData = active.data.current;

    if (activeId === overId) return;

    const isActiveAColumn = activeData?.type === "Column";
    if (!isActiveAColumn) return;

    setColumns((columns) => {
      const activeColumnIndex = columns.findIndex((col) => col.id === activeId);

      const overColumnIndex = columns.findIndex((col) => col.id === overId);

      return arrayMove(columns, activeColumnIndex, overColumnIndex);
    });
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    if (!hasDraggableData(active) || !hasDraggableData(over)) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    const isActiveATask = activeData?.type === "Task";
    const isOverATask = overData?.type === "Task";

    if (!isActiveATask) return;

    // Im dropping a Task over another Task
    if (isActiveATask && isOverATask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);
        const activeTask = tasks[activeIndex];
        const overTask = tasks[overIndex];
        if (
          activeTask &&
          overTask &&
          activeTask.columnId !== overTask.columnId
        ) {
          activeTask.columnId = overTask.columnId;
          return arrayMove(tasks, activeIndex, overIndex - 1);
        }

        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    const isOverAColumn = overData?.type === "Column";

    // Im dropping a Task over a column
    if (isActiveATask && isOverAColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const activeTask = tasks[activeIndex];
        if (activeTask) {
          activeTask.columnId = overId as ColumnId;
          return arrayMove(tasks, activeIndex, activeIndex);
        }
        return tasks;
      });
    }
  }
}
