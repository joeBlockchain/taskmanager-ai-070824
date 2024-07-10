// src/components/kanban/types.ts
import type { UniqueIdentifier } from "@dnd-kit/core";

// Column Types
export interface Column {
  id: UniqueIdentifier;
  title: string;
}

export type ColumnType = "Column";

export interface ColumnDragData {
  type: ColumnType;
  column: Column;
}

// Task Types
export interface Task {
  id: UniqueIdentifier;
  columnId: Column["id"];
  title: string;
  content: string;
}

export type TaskType = "Task";

export interface TaskDragData {
  type: TaskType;
  task: Task;
}
