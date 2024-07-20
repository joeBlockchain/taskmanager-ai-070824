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
    deliverables?: Deliverable[]; 
}
  
  export interface Column {
    id: string;
    user_id: string;
    title: string;
    description: string;
    created_at: string;
    updated_at: string;
  }

  export interface Project {
    id: string;
    user_id: string;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
  }

  export interface Deliverable {
    id: string;
    task_id: string;
    user_id: string;
    title: string;
    description?: string;
    status: 'Not Started' | 'In Progress' | 'Completed' | 'Approved' | 'Rejected';
    due_date?: string;
    file_url?: string;
    created_at: string;
    updated_at: string;
    is_archived: boolean;
  }