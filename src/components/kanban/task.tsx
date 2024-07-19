"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlignLeft,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock4,
  Flag,
  GripVertical,
  PencilLine,
  PlusIcon,
  Trash2,
  Check,
  X,
} from "lucide-react";
import {
  Task as TaskType,
  Column as ColumnType,
} from "@/components/kanban/types";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface TaskProps {
  task: TaskType;
  deleteTask: (taskId: string) => void;
  updateTask: (taskId: string, title: string, description: string) => void;
  moveTask: (taskId: string, newColumnId: string) => void;
  columns: ColumnType[];
}

export default function Task({
  task,
  deleteTask,
  updateTask,
  moveTask,
  columns,
}: TaskProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);

  const currentColumnIndex = columns.findIndex(
    (col) => col.id === task.column_id
  );
  const prevColumn = columns[currentColumnIndex - 1];
  const nextColumn = columns[currentColumnIndex + 1];

  const handleSave = () => {
    updateTask(task.id, title, description);
    setIsEditing(false);
  };

  return (
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
            onClick={() => setIsEditing(true)}
          >
            <PencilLine className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="w-[2rem] h-[2rem] p-0 m-0"
            onClick={() => deleteTask(task.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <CardHeader className="px-6 py-2 m-0">
        {isEditing ? (
          <div className="flex flex-col gap-4">
            <div className="grid items-center gap-1.5">
              <Label htmlFor="title" className="text-muted-foreground">
                Task Title
              </Label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className=""
              />
            </div>
            <div className="grid items-center gap-1.5">
              <Label htmlFor="description" className="text-muted-foreground">
                Task Description
              </Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className=""
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="secondary"
                className="px-2 m-0 h-[2rem]"
                onClick={handleSave}
              >
                <Check className="h-4 w-4 mr-2" /> Save
              </Button>
              <Button
                variant="destructive"
                className="px-2 m-0 h-[2rem]"
                onClick={() => setIsEditing(false)}
              >
                <X className="h-4 w-4 mr-2" /> Cancel
              </Button>
            </div>
          </div>
        ) : (
          <CardTitle className="text-lg">{task.title}</CardTitle>
        )}
      </CardHeader>
      <Separator />
      <CardContent className="px-6 py-2 m-0 text-muted-foreground space-y-3">
        <>
          <div className="flex items-center gap-3">
            <AlignLeft className="h-4 w-4 flex-none" />
            <p>{task.description || "-"}</p>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 flex-none" />
            <p>
              {task.due_date
                ? formatDistanceToNow(new Date(task.due_date))
                : "-"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Flag className="h-4 w-4 flex-none" />
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
        </>
      </CardContent>
      <Separator />
      <CardFooter className="px-5 py-2 m-0 justify-between">
        <div className="flex flex-row items-center space-x-2  text-muted-foreground">
          <PlusIcon className="h-4 w-4" />
          <p className="text-sm">
            {task.created_at
              ? formatDistanceToNow(new Date(task.created_at))
              : "-"}
          </p>
        </div>
        <div className="flex flex-row items-center space-x-2 text-muted-foreground">
          <Clock4 className="h-4 w-4" />
          <p className="text-sm  ">
            {task.updated_at
              ? formatDistanceToNow(new Date(task.updated_at))
              : "-"}
          </p>
        </div>
        <>
          {prevColumn && (
            <Button
              variant="outline"
              className="absolute hidden group-hover:flex w-[1.75rem] h-[1.75rem] p-0 m-0 -left-[.75rem] bottom-[1rem]"
              onClick={() => moveTask(task.id, prevColumn.id)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          {nextColumn && (
            <Button
              variant="outline"
              className="absolute hidden group-hover:flex w-[1.75rem] h-[1.75rem] p-0 m-0 -right-[.75rem] bottom-[1rem]"
              onClick={() => moveTask(task.id, nextColumn.id)}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </>
      </CardFooter>
    </Card>
  );
}
