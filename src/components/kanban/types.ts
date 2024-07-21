export interface KanbanWrapperProps {
  projectId: string;
  initialColumns: Column[];
  initialTasks: Task[];
  initialDeliverables: Deliverable[];
}

  export interface Project {
    id: string;
    user_id: string;
    name: string;
    description: string;
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

  export interface Deliverable {
    id: string;
    task_id: string;
    user_id: string;
    title: string;
    description?: string;
    status: 'Not Started' | 'In Progress' | 'Completed' | 'Approved' | 'Rejected';
    due_date?: string;
    created_at: string;
    updated_at: string;
    is_archived: boolean;
  }

  export interface DeliverableContent {
    id: string;
    deliverable_id: string;
    content: string;
    created_at: string;
    updated_at: string;
  }

  export interface DeliverableContentVersion {
    id: string;
    deliverable_content_id: string;
    content: string;
    created_at: string;
    created_by: string | null;
  }