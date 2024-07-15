"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PencilLine, Trash2 } from "lucide-react";
import Task from "./task";
import {
  Column as ColumnType,
  Task as TaskType,
} from "@/app/(workspace)/workspace/types";

interface ColumnProps {
  column: ColumnType;
  tasks: TaskType[];
  addTask: (columnId: string) => void;
  deleteTask: (taskId: string) => void;
  deleteColumn: (columnId: string) => void;
}

export default function Column({
  column,
  tasks,
  addTask,
  deleteTask,
  deleteColumn,
}: ColumnProps) {
  return (
    <Card key={column.id} className="relative w-[22rem] h-fit group/column">
      <div className="absolute hidden group-hover/column:flex w-[1.5rem] -right-[.5rem] top-[.5rem] ">
        <div className="flex flex-col space-y-1">
          <Button variant="outline" className="w-[2rem] h-[2rem] p-0 m-0">
            <PencilLine className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="w-[2rem] h-[2rem] p-0 m-0"
            onClick={() => deleteColumn(column.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <CardHeader>
        <CardTitle className="">{column.title}</CardTitle>
        <CardDescription className="pb-2">{column.description}</CardDescription>
        <Separator className="" />
      </CardHeader>

      <CardContent>
        <div className="flex flex-col gap-4">
          {tasks
            .filter((task) => task.column_id === column.id)
            .map((task) => (
              <Task key={task.id} task={task} deleteTask={deleteTask} />
            ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          onClick={() => addTask(column.id)}
          className="w-full text-muted-foreground"
        >
          Add Task
        </Button>
      </CardFooter>
    </Card>
  );
}
