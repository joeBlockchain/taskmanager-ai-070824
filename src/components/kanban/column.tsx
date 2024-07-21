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
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { GripVertical, PencilLine, Trash2, Check, X } from "lucide-react";
import Task from "./task";
import {
  Column as ColumnType,
  Task as TaskType,
} from "@/components/kanban/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ColumnProps {
  column: ColumnType;
  columns: ColumnType[];
  tasks: TaskType[];
  setTasks: React.Dispatch<React.SetStateAction<TaskType[]>>;
  addTask: (columnId: string) => void;
  deleteTask: (taskId: string) => void;
  moveTask: (taskId: string, newColumnId: string) => void;
  deleteColumn: (columnId: string) => void;
  updateColumn: (columnId: string, title: string, description: string) => void;
}

export default function Column({
  column,
  columns,
  tasks,
  setTasks,
  addTask,
  deleteTask,
  moveTask,
  deleteColumn,
  updateColumn,
}: ColumnProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(column.title);
  const [description, setDescription] = useState(column.description);

  const handleSave = () => {
    updateColumn(column.id, title, description);
    setIsEditing(false);
  };

  return (
    <Card key={column.id} className="relative w-full h-fit group/column">
      {/* <Button
        variant="outline"
        className="absolute hidden group-hover/column:flex p-0 m-0 w-[1.5rem] -left-[.75rem] top-[.5rem]"
      >
        <GripVertical className="h-4 w-4" />
      </Button> */}
      <div className="absolute hidden group-hover/column:flex w-[1.5rem] -right-[.5rem] top-[.5rem] ">
        <div className="flex flex-col space-y-1">
          <Button
            variant="outline"
            className="w-[2rem] h-[2rem] p-0 m-0"
            onClick={() => setIsEditing(true)}
          >
            <PencilLine className="h-4 w-4" />
          </Button>
          {/* <Button
            variant="outline"
            className="w-[2rem] h-[2rem] p-0 m-0"
            onClick={() => deleteColumn(column.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button> */}
        </div>
      </div>
      <CardHeader>
        {isEditing ? (
          <div className="flex flex-col gap-4">
            <div className="grid items-center gap-1.5">
              <Label htmlFor="title" className="text-muted-foreground">
                Column Title
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
                Column Description
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
                <X className="h-4 w-4 mr-2" /> Cancle
              </Button>
            </div>
            <Separator />
          </div>
        ) : (
          <>
            <CardTitle>{column.title}</CardTitle>
            <CardDescription className="pb-2">
              {column.description}
            </CardDescription>
            <Separator />
          </>
        )}
      </CardHeader>

      <CardContent>
        <div className="flex flex-col gap-4">
          {tasks
            ?.filter((task) => task.column_id === column.id)
            .map((task) => (
              <Task
                key={task.id}
                task={task}
                setTasks={setTasks}
                deleteTask={deleteTask}
                moveTask={moveTask}
                columns={columns}
              />
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
