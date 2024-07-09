import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { useDndContext, type UniqueIdentifier } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useMemo } from "react";
import { Task, TaskCard } from "./TaskCard";
import { cva } from "class-variance-authority";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GripVertical, Pencil, PlusIcon, Trash2 } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState, useRef, useEffect } from "react";
import { Input } from "../ui/input";

export interface Column {
  id: UniqueIdentifier;
  title: string;
}

export type ColumnType = "Column";

export interface ColumnDragData {
  type: ColumnType;
  column: Column;
}

interface BoardColumnProps {
  column: Column;
  tasks: Task[];
  isOverlay?: boolean;
  onAddTask: (columnId: UniqueIdentifier) => void;
  onDeleteTask: (taskId: UniqueIdentifier) => void;
  onDeleteColumn: (columnId: UniqueIdentifier, tasks: Task[]) => void;
  onUpdateColumn: (columnId: UniqueIdentifier, newTitle: string) => void;
}

export function BoardColumn({
  column,
  tasks,
  isOverlay,
  onAddTask,
  onDeleteTask,
  onDeleteColumn,
  onUpdateColumn,
}: BoardColumnProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(column.title);
  const inputRef = useRef<HTMLInputElement>(null);

  const tasksIds = useMemo(() => {
    return tasks.map((task) => task.id);
  }, [tasks]);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    } satisfies ColumnDragData,
    attributes: {
      roleDescription: `Column: ${column.title}`,
    },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  const variants = cva(
    "w-[350px] max-w-full bg-primary-foreground flex flex-col flex-shrink-0 snap-center",
    {
      variants: {
        dragging: {
          default: "border-2 border-transparent",
          over: "ring-2 opacity-30",
          overlay: "ring-2 ring-primary",
        },
      },
    }
  );

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  const handleEditComplete = () => {
    if (editedTitle.trim() !== "") {
      onUpdateColumn(column.id, editedTitle.trim());
    } else {
      setEditedTitle(column.title);
    }
    setIsEditing(false);
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={variants({
        dragging: isOverlay ? "overlay" : isDragging ? "over" : undefined,
      })}
    >
      <CardHeader className="p-4 font-semibold border-b-2 flex flex-row items-center">
        <div className="flex items-center flex-1 justify-between">
          <div className="flex items-center flex-1 ">
            <Button
              variant={"ghost"}
              {...attributes}
              {...listeners}
              className="p-1 text-primary/50 -ml-2 h-auto cursor-grab relative"
            >
              <span className="sr-only">{`Move column: ${column.title}`}</span>
              <GripVertical />
            </Button>

            {isEditing ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleEditComplete();
                }}
                className="flex-1"
              >
                <Input
                  ref={inputRef}
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onBlur={handleEditComplete}
                  className="h-7 px-2 text-base"
                />
              </form>
            ) : (
              <div className="flex items-center justify-between flex-1">
                <span className="text-xl">{column.title}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditing(true)}
                  className="h-8 w-8 ml-2"
                >
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Edit column title</span>
                </Button>
              </div>
            )}
          </div>
          <AlertDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Are you sure you want to delete this column?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This will delete the following tasks:
                  <ul className="list-disc pl-5 mt-2">
                    {tasks.map((task) => (
                      <li key={task.id}>{task.title}</li>
                    ))}
                  </ul>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    onDeleteColumn(column.id, tasks);
                    setIsDeleteDialogOpen(false);
                  }}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <ScrollArea>
        <CardContent className="flex flex-grow flex-col gap-2 p-2">
          <SortableContext items={tasksIds}>
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onDelete={onDeleteTask} // Pass onDeleteTask here
              />
            ))}
          </SortableContext>
          <Button
            onClick={() => onAddTask(column.id)}
            className="mt-2"
            variant="secondary"
            size="sm"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </CardContent>
      </ScrollArea>
    </Card>
  );
}

export function BoardContainer({ children }: { children: React.ReactNode }) {
  const dndContext = useDndContext();

  const variations = cva("px-2 md:px-0 flex lg:justify-center pb-4", {
    variants: {
      dragging: {
        default: "snap-x snap-mandatory",
        active: "snap-none",
      },
    },
  });

  return (
    <ScrollArea
      className={variations({
        dragging: dndContext.active ? "active" : "default",
      })}
    >
      <div className="flex gap-4 items-start flex-row justify-start">
        {children}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
