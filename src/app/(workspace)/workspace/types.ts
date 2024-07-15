export interface Task {
    id: string;
    user_id: string;
    column_id: string;
    title: string;
    description: string;
    due_date: string;
    priority: string;
    created_at: string;
    updated_at: string;
  }
  
  export interface Column {
    id: string;
    user_id: string;
    title: string;
    description: string;
    created_at: string;
    updated_at: string;
  }