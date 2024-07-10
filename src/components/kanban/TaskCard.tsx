import { useState } from "react";
import type { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cva } from "class-variance-authority";
import {
  ArrowLeft,
  ArrowRight,
  GripVertical,
  Pencil,
  Trash2,
} from "lucide-react";

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
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";

interface TaskCardProps {
  task: Task;
  isOverlay?: boolean;
  onDelete: (taskId: UniqueIdentifier) => void;
  onUpdate: (taskId: UniqueIdentifier, updatedTask: Partial<Task>) => void;
  onBump: (taskId: UniqueIdentifier, direction: "left" | "right") => void;
  isLeftmostColumn: boolean;
  isRightmostColumn: boolean;
}

import { type Task, type TaskDragData } from "./types";

export function TaskCard({
  task,
  isOverlay,
  onDelete,
  onUpdate,
  onBump,
  isLeftmostColumn,
  isRightmostColumn,
}: TaskCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedContent, setEditedContent] = useState(task.content);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    } satisfies TaskDragData,
    attributes: {
      roleDescription: "Task",
    },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  const variants = cva("", {
    variants: {
      dragging: {
        over: "ring-2 opacity-30",
        overlay: "ring-2 ring-primary",
      },
    },
  });

  const handleEditComplete = () => {
    onUpdate(task.id, {
      title: editedTitle.trim(),
      content: editedContent.trim(),
    });
    setIsEditDialogOpen(false);
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`group/task ${variants({
        dragging: isOverlay ? "overlay" : isDragging ? "over" : undefined,
      })}`}
    >
      <CardHeader className="px-3 py-3 flex flex-row items-center border-b-2 border-secondary">
        <div className="flex items-center flex-1 justify-between">
          <div className="flex items-center flex-1 ">
            <Button
              variant={"ghost"}
              {...attributes}
              {...listeners}
              className="p-1 text-secondary-foreground/50 -ml-2 h-auto cursor-grab"
            >
              <span className="sr-only">Move task</span>
              <GripVertical />
            </Button>
            <span className="text-lg">{task.title}</span>
          </div>
          <div className="flex items-center">
            <AlertDialog
              open={isEditDialogOpen}
              onOpenChange={setIsEditDialogOpen}
            >
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden group-hover/task:flex h-8 w-8 mr-1"
                >
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Edit task</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Edit Task</AlertDialogTitle>
                  <AlertDialogDescription>
                    Make changes to your task here. Click save when youre done.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="title" className="text-right">
                      Title
                    </label>
                    <Input
                      id="title"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="content" className="text-right">
                      Content
                    </label>
                    <Textarea
                      id="content"
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleEditComplete}>
                    Save
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button
              variant="ghost"
              size="icon"
              className="hidden group-hover/task:flex h-8 w-8"
              onClick={() => onDelete(task.id)}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete task</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-3 pt-3 pb-6 text-left whitespace-pre-wrap text-muted-foreground">
        {task.content}
      </CardContent>
      <CardFooter className="h-10 px-1 py-1 my-0 border-t border-border justify-between">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hidden group-hover/task:flex"
          onClick={() => onBump(task.id, "left")}
          disabled={isLeftmostColumn}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hidden group-hover/task:flex"
          onClick={() => onBump(task.id, "right")}
          disabled={isRightmostColumn}
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
