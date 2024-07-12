import {
  createColumn,
  updateColumn,
  deleteColumn,
  createTask,
  updateTask,
  deleteTask,
} from "./tools";

export function processToolCall(toolName: string, toolInput: any) {
  switch (toolName) {
    case "create_column":
      return createColumn(toolInput.title);
    case "update_column":
      return updateColumn(toolInput.column_id, toolInput.new_title);
    case "delete_column":
      return deleteColumn(toolInput.column_id);
    case "create_task":
      return createTask(
        toolInput.column_id,
        toolInput.title,
        toolInput.content
      );
    case "update_task":
      return updateTask(
        toolInput.task_id,
        toolInput.new_title,
        toolInput.new_content
      );
    case "delete_task":
      return deleteTask(toolInput.task_id);
    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}
