"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
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
  Deliverable as DeliverableType,
} from "@/components/kanban/types";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import TaskEdit from "./task-edit";

interface TaskProps {
  task: TaskType;
  setTasks: React.Dispatch<React.SetStateAction<TaskType[]>>;
  deleteTask: (taskId: string) => void;
  moveTask: (taskId: string, newColumnId: string) => void;
  columns: ColumnType[];
  deliverables: DeliverableType[];
  setDeliverables: React.Dispatch<React.SetStateAction<DeliverableType[]>>;
}

export default function Task({
  task,
  setTasks,
  deleteTask,
  moveTask,
  columns,
  deliverables,
  setDeliverables,
}: TaskProps) {
  const currentColumnIndex = columns.findIndex(
    (col) => col.id === task.column_id
  );
  const prevColumn = columns[currentColumnIndex - 1];
  const nextColumn = columns[currentColumnIndex + 1];

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
          <TaskEdit
            task={task}
            setTasks={setTasks}
            deliverables={deliverables}
            setDeliverables={setDeliverables}
          />
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
        <CardTitle className="text-lg">{task.title}</CardTitle>
        <CardDescription>{task.id}</CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className="px-6 py-2 m-0 text-muted-foreground space-y-3">
        <>
          <div className="flex items-center gap-3">
            <AlignLeft className="h-4 w-4 flex-none" />
            <p>
              {task.description
                ? task.description.length > 100
                  ? `${task.description.substring(0, 100)}...`
                  : task.description
                : "-"}
            </p>
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
                    ? "bg-red-100 text-red-700 dark:bg-red-7  00 dark:text-red-100"
                    : task.priority === "high"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-700 dark:text-blue-100"
                    : task.priority === "medium"
                    ? "bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-100"
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
