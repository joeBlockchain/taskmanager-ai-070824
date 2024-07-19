"use client";

import React, { createContext, useState } from "react";
import Kanban from "@/components/kanban/kanaban";
import Chat from "@/components/chat/chat";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MessageSquare } from "lucide-react";
import { Column as ColumnType, Task as TaskType } from "./types";

interface KanbanWrapperProps {
  projectId: string;
  initialColumns: ColumnType[];
  initialTasks: TaskType[];
}

export const KanbanContext = createContext<{
  columns: ColumnType[];
  tasks: TaskType[];
  setColumns: React.Dispatch<React.SetStateAction<ColumnType[]>>;
  setTasks: React.Dispatch<React.SetStateAction<TaskType[]>>;
}>({
  columns: [],
  tasks: [],
  setColumns: () => {},
  setTasks: () => {},
});

export default function KanbanWrapper({
  projectId,
  initialColumns,
  initialTasks,
}: KanbanWrapperProps) {
  const [columns, setColumns] = useState<ColumnType[]>(initialColumns);
  const [tasks, setTasks] = useState<TaskType[]>(initialTasks);

  return (
    <KanbanContext.Provider value={{ columns, tasks, setColumns, setTasks }}>
      <Kanban projectId={projectId} />
      <Popover>
        <PopoverTrigger className="fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-lg border-border border flex items-center justify-center">
          <MessageSquare className="h-6 w-6" aria-hidden="true" />
        </PopoverTrigger>
        <PopoverContent className="h-[calc(100vh-7rem)] w-[28rem]">
          <Chat projectId={projectId} />
        </PopoverContent>
      </Popover>
    </KanbanContext.Provider>
  );
}
