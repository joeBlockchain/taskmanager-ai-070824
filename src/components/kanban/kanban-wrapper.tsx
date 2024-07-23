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
import {
  Column as ColumnType,
  Task as TaskType,
  Deliverable as DeliverableType,
} from "./types";

interface KanbanWrapperProps {
  projectId: string;
  initialColumns: ColumnType[];
  initialTasks: TaskType[];
  initialDeliverables: DeliverableType[];
}

export const KanbanContext = createContext<{
  columns: ColumnType[];
  tasks: TaskType[];
  deliverables: DeliverableType[];
  setColumns: React.Dispatch<React.SetStateAction<ColumnType[]>>;
  setTasks: React.Dispatch<React.SetStateAction<TaskType[]>>;
  setDeliverables: React.Dispatch<React.SetStateAction<DeliverableType[]>>;
}>({
  columns: [],
  tasks: [],
  deliverables: [],
  setColumns: () => {},
  setTasks: () => {},
  setDeliverables: () => {},
});

export default function KanbanWrapper({
  projectId,
  initialColumns,
  initialTasks,
  initialDeliverables,
}: KanbanWrapperProps) {
  const [columns, setColumns] = useState<ColumnType[]>(initialColumns);
  const [tasks, setTasks] = useState<TaskType[]>(initialTasks);
  const [deliverables, setDeliverables] =
    useState<DeliverableType[]>(initialDeliverables);

  return (
    <KanbanContext.Provider
      value={{
        columns,
        tasks,
        deliverables,
        setColumns,
        setTasks,
        setDeliverables,
      }}
    >
      <Kanban projectId={projectId} />
      <Popover>
        <PopoverTrigger className="fixed bottom-4 right-4 h-14 w-14 rounded-full drop-shadow-xl border-primary/80 border flex items-center justify-center bg-background">
          <MessageSquare className="h-6 w-6" aria-hidden="true" />
        </PopoverTrigger>
        <PopoverContent className="h-[calc(100vh-7rem)] w-screen sm:w-[28rem]">
          <Chat projectId={projectId} />
        </PopoverContent>
      </Popover>
    </KanbanContext.Provider>
  );
}
