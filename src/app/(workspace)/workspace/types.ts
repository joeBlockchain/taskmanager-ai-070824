export interface Task {
    id: string;
    title: string;
    description: string;
    column_id: string;
    priority: string;
    due_date: string;
    created_at: string;
    updated_at: string;
  }
  
  export interface Column {
    id: string;
    title: string;
    description: string;
  }