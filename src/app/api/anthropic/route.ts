import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/utils/supabase/server";
import { marked } from 'marked';

export const runtime = "edge";

// Define cost constants
const INPUT_TOKEN_COST = 3; // Cost per 1,000,000 input tokens
const OUTPUT_TOKEN_COST = 15; // Cost per 1,000,000 output tokens

// Define the system message for role prompting
const SYSTEM_MESSAGE = `You are an AI assistant. You are free to answer questions with or without the tools. You do not need to remind the user
each time you respond that you do not have a tool for the user's question. When a tool is a good fit for the user's question, you can use the tool.
When using a tool, please let the user know what tool you are using and why. When you are using the summarize_url tool be sure to include in your
response the URL you are summarizing even if the user provided the url in their message.`;
// Define tool types
type ToolSchema = {
  type: "object";
  properties: Record<string, { 
    type: string; 
    items?: {  //used if passing an array of objects
      type: string; 
      description?: string;
      properties?: Record<string, unknown>;
      required?: string[]; 
    }; 
    enum?: string[];
    description: string 
  }>;
  required: string[];
};

type Tool = {
  name: string;
  description: string;
  schema: ToolSchema;
  handler: (input: any, userId: string) => Promise<string>;
};

// Define tools
const tools: Tool[] = [
  {
    name: "generate_random_number",
    description: "Generates a random number within a specified range.",
    schema: {
      type: "object",
      properties: {
        min: {
          type: "number",
          description: "The minimum value of the range (inclusive).",
        },
        max: {
          type: "number",
          description: "The maximum value of the range (inclusive).",
        },
      },
      required: ["min", "max"],
    },
    handler: async ({ min, max }: { min: number; max: number }) => {
      console.log(`Generating random number between ${min} and ${max}`);
      const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
      return randomNumber.toString();
    },
  },
  {
    name: "get_current_datetime",
    description: "Gets the current date and time.",
    schema: {
      type: "object",
      properties: {},
      required: [],
    },
    handler: async () => {
      const now = new Date();
      const currentDateTime = now.toISOString();
      console.log("Current date and time:", currentDateTime);
      return currentDateTime;
    },
  },
  {
    name: "get_website_content",
    description: "Retrieves the content of a given URL using Jina AI Reader which will return the markdown content of the website.",
    schema: {
      type: "object",
      properties: {
        url: { type: "string", description: "The URL to retrieve the content from." },
      },
      required: ["url"],
    },
    handler: async ({ url }: { url: string }) => {
      console.log("Summarizing URL:", url);
      try {
        const response = await fetch(`https://r.jina.ai/${url}`, {
          headers: {
            "X-Return-Format": "text",
            Authorization: `Bearer ${process.env.JINA_API_KEY}`,
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const readerResponse = await response.text();
        console.log(
          "Jina AI Reader response:",
          readerResponse.substring(0, 200) + "..."
        );
        return readerResponse;
      } catch (error) {
        console.error("Error fetching URL content:", error);
        return `Error: Unable to fetch URL content. ${error}`;
      }
    },
  },
  {
    name: "jina_search",
    description: "Performs a web search using Jina AI Reader API and returns the top results.  When using the jina_search tool, please include the query in your response. Also include the URL of the search results.",
    schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "The search query to perform." },
      },
      required: ["query"],
    },
    handler: async ({ query }: { query: string }) => {
      console.log("Performing Jina search for:", query);
      try {
        const response = await fetch(`https://s.jina.ai/${encodeURIComponent(query)}`, {
          headers: {
            "X-Return-Format": "text",
            Authorization: `Bearer ${process.env.JINA_API_KEY}`,
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const searchResults = await response.text();
        console.log(
          "Jina search results:",
          searchResults.substring(0, 200) + "..."
        );
        return searchResults;
      } catch (error) {
        console.error("Error performing Jina search:", error);
        return `Error: Unable to perform Jina search. ${error}`;
      }
    },
  },
  {
    name: "add_tasks",
    description: "Adds one or multiple tasks to a column. Use this for adding any number of tasks, including just one task.",
    schema: {
      type: "object",
      properties: {
        columnId: {
          type: "string",
          description: "The ID of the column to add the task(s) to.",
        },
        tasks: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: {
                type: "string",
                description: "The title of the task.",
              },
              description: {
                type: "string",
                description: "The description of the task.",
              },
              due_date: {
                type: "string",
                description: "The due date of the task in ISO 8601 format (YYYY-MM-DD).",
              },
              priority: {
                type: "string",
                description: "The priority of the task.",
                enum: ["urgent", "high", "medium", "low"],
              },
              deliverables: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: {
                      type: "string",
                      description: "The title of the deliverable.",
                    },
                    description: {
                      type: "string",
                      description: "The description of the deliverable.",
                    },
                    due_date: {
                      type: "string",
                      description: "The due date of the deliverable in ISO 8601 format (YYYY-MM-DD).",
                    },
                    status: {
                      type: "string",
                      description: "The status of the deliverable.",
                      enum: ["Not Started", "In Progress", "Completed", "Approved", "Rejected"],
                    },
                  },
                  required: ["title", "status"],
                },
                description: "An array of deliverables to add with the task.",
              },
            },
            required: ["title", "description", "due_date", "priority"],
          },
          description: "An array of tasks to add. For a single task, use an array with one object.",
        },
      },
      required: ["columnId", "tasks"],
    },
    handler: async ({ columnId, tasks }: { columnId: string; tasks: { title: string; description: string; due_date: string; priority: string; deliverables?: { title: string; description: string; due_date: string; status: string }[] }[] }, userId: string) => {
      console.log(`Adding multiple tasks to column: ${columnId}`);
      try {
        const supabase = createClient();

        // Fetch available columns
        const { data: columns, error: columnsError } = await supabase
          .from("columns")
          .select("id, title")
          .eq("user_id", userId);

        if (columnsError) throw columnsError;

        // Check if the specified columnId exists
        const columnExists = columns.some(column => column.id === columnId);
        if (!columnExists) {
          return `Error: Column with ID "${columnId}" does not exist. Available columns: ${JSON.stringify(columns)}`;
        }

        for (const task of tasks) {
          const { title, description, due_date, priority, deliverables } = task;

          // Add the task
          const { data: taskData, error: taskError } = await supabase
            .from("tasks")
            .insert({ title, column_id: columnId, user_id: userId, description, due_date, priority })
            .select();

          if (taskError) throw taskError;

          const taskId = taskData[0].id;

          // Add deliverables if provided
          if (deliverables && deliverables.length > 0) {
            const deliverableData = deliverables.map(deliverable => ({ ...deliverable, task_id: taskId, user_id: userId }));
            const { error: deliverableError } = await supabase
              .from("deliverables")
              .insert(deliverableData);

            if (deliverableError) throw deliverableError;
          }
        }

        console.log("Tasks and deliverables added successfully");
        return `Tasks added successfully to column "${columnId}". Available columns: ${JSON.stringify(columns)}`;
      } catch (error) {
        console.error("Error adding tasks and deliverables:", error);
        return `Error: Unable to add tasks and deliverables. ${error}`;
      }
    },
  },
  {
    name: "update_task_properties",
    description: "Updates one or multiple tasks' main properties (title, description, due date, priority, column). Does not modify task deliverables.",

    schema: {
      type: "object",
      properties: {
        tasks: {
          type: "array",
          items: {
            type: "object",
            properties: {
              taskId: {
                type: "string",
                description: "The ID of the task to update.",
              },
              title: {
                type: "string",
                description: "The new title of the task.",
              },
              description: {
                type: "string",
                description: "The new description of the task.",
              },
              due_date: {
                type: "string",
                description: "The new due date of the task in ISO 8601 format (YYYY-MM-DD).",
              },
              priority: {
                type: "string",
                description: "The new priority of the task.",
                enum: ["urgent", "high", "medium", "low"],
              },
              columnId: {
                type: "string",
                description: "The ID of the column to move the task to (optional).",
              },
            },
            required: ["taskId", "title", "description", "due_date", "priority"],
          },
          description: "An array of tasks to update.",
        },
      },
      required: ["tasks"],
    },
    handler: async ({ tasks }: { tasks: { taskId: string; title: string; description: string; due_date: string; priority: string; columnId?: string }[] }, userId: string) => {
      console.log(`Updating tasks`);
      try {
        const supabase = createClient();
  
        // Fetch available columns
        const { data: columns, error: columnsError } = await supabase
          .from("columns")
          .select("id, title")
          .eq("user_id", userId);
  
        if (columnsError) throw columnsError;
  
        for (const task of tasks) {
          const { taskId, title, description, due_date, priority, columnId } = task;
  
          // Check if the specified columnId exists (if provided)
          if (columnId) {
            const columnExists = columns.some(column => column.id === columnId);
            if (!columnExists) {
              return `Error: Column with ID "${columnId}" does not exist. Available columns: ${JSON.stringify(columns)}`;
            }
          }
  
          const updateData: any = { title, description, due_date, priority };
          if (columnId) {
            updateData.column_id = columnId;
          }
  
          const { error } = await supabase
            .from("tasks")
            .update(updateData)
            .eq("id", taskId)
            .eq("user_id", userId);
  
          if (error) throw error;
          console.log(`Task with ID "${taskId}" updated successfully`);
        }
  
        return `Tasks updated successfully.`;
      } catch (error) {
        console.error("Error updating tasks:", error);
        return `Error: Unable to update tasks. ${error}`;
      }
    },
  },
  {
    name: "delete_tasks",
    description: "Deletes one or multiple tasks.",
    schema: {
      type: "object",
      properties: {
        taskIds: {
          type: "array",
          items: {
            type: "string",
            description: "The ID of the task to delete.",
          },
          description: "An array of task IDs to delete.",
        },
      },
      required: ["taskIds"],
    },
    handler: async ({ taskIds }: { taskIds: string[] }, userId: string) => {
      console.log(`Deleting tasks with IDs: ${taskIds.join(", ")}`);
      try {
        const supabase = createClient();
  
        const { error } = await supabase
          .from("tasks")
          .delete()
          .in("id", taskIds)
          .eq("user_id", userId);
  
        if (error) throw error;
        console.log("Tasks deleted successfully");
        return `Tasks with IDs "${taskIds.join(", ")}" deleted successfully.`;
      } catch (error) {
        console.error("Error deleting tasks:", error);
        return `Error: Unable to delete tasks. ${error}`;
      }
    },
  },
  {
    name: "manage_task_deliverables",
    description: "Manages deliverables for a task. Can add new deliverables, update existing ones, delete deliverables from a task, or transfer deliverables between tasks.",
    schema: {
      type: "object",
      properties: {
        taskId: {
          type: "string",
          description: "The ID of the task to manage deliverables for.",
        },
        operations: {
          type: "array",
          items: {
            type: "object",
            properties: {
              operation: {
                type: "string",
                enum: ["add", "update", "delete", "transfer"],
                description: "The operation to perform on the deliverable.",
              },
              deliverable: {
                type: "object",
                properties: {
                  id: {
                    type: "string",
                    description: "The ID of the deliverable (required for update, delete, and transfer operations).",
                  },
                  title: {
                    type: "string",
                    description: "The title of the deliverable.",
                  },
                  description: {
                    type: "string",
                    description: "The description of the deliverable.",
                  },
                  due_date: {
                    type: "string",
                    description: "The due date of the deliverable in ISO 8601 format (YYYY-MM-DD).",
                  },
                  status: {
                    type: "string",
                    enum: ["Not Started", "In Progress", "Completed", "Approved", "Rejected"],
                    description: "The status of the deliverable.",
                  },
                },
                required: ["title", "status"],
              },
              newTaskId: {
                type: "string",
                description: "The ID of the new task to transfer the deliverable to (required for transfer operation).",
              },
            },
            required: ["operation", "deliverable"],
          },
          description: "An array of operations to perform on deliverables.",
        },
      },
      required: ["taskId", "operations"],
    },
    handler: async ({ taskId, operations }, userId) => {
      console.log(`Managing deliverables for task ${taskId}`);
      try {
        const supabase = createClient();
  
        // Check if the task exists and belongs to the user
        const { data: task, error: taskError } = await supabase
          .from("tasks")
          .select("id")
          .eq("id", taskId)
          .eq("user_id", userId)
          .single();

        console.log("task", task);
        console.log("taskError", taskError);
  
        if (taskError || !task) {
          return `Error: with "${taskId}". TaskError: ${JSON.stringify(taskError)}`;
        }
  
        for (const op of operations) {
          const { operation, deliverable, newTaskId } = op;
          console.log("operation", operation);
          console.log("deliverable", deliverable);
  
          switch (operation) {
            case "add":
              const { error: addError } = await supabase
                .from("deliverables")
                .insert({ ...deliverable, task_id: taskId, user_id: userId });
              if (addError) throw addError;
              console.log(`Added deliverable "${deliverable.title}" to task ${taskId}`);
              break;
  
            case "update":
              if (!deliverable.id) {
                console.error("Deliverable ID is required for update operation");
                continue;
              }
              console.log("deliverable", deliverable);
              const { error: updateError } = await supabase
                .from("deliverables")
                .update(deliverable)
                .eq("id", deliverable.id)
                .eq("task_id", taskId)
                .eq("user_id", userId);
              if (updateError) throw updateError;
              console.log(`Updated deliverable ${deliverable.id} for task ${taskId}`);
              break;
  
            case "delete":
              if (!deliverable.id) {
                console.error("Deliverable ID is required for delete operation");
                continue;
              }
              const { error: deleteError } = await supabase
                .from("deliverables")
                .delete()
                .eq("id", deliverable.id)
                .eq("task_id", taskId)
                .eq("user_id", userId);
              if (deleteError) throw deleteError;
              console.log(`Deleted deliverable ${deliverable.id} from task ${taskId}`);
              break;
  
            case "transfer":
              if (!deliverable.id || !newTaskId) {
                console.error("Deliverable ID and new task ID are required for transfer operation");
                continue;
              }
              // Check if the new task exists and belongs to the user
              const { data: newTask, error: newTaskError } = await supabase
                .from("tasks")
                .select("id")
                .eq("id", newTaskId)
                .eq("user_id", userId)
                .single();

              if (newTaskError || !newTask) {
                console.error(`Error: New task "${newTaskId}" not found or doesn't belong to the user`);
                continue;
              }

              const { error: transferError } = await supabase
                .from("deliverables")
                .update({ task_id: newTaskId })
                .eq("id", deliverable.id)
                .eq("user_id", userId);

              if (transferError) throw transferError;
              console.log(`Transferred deliverable ${deliverable.id} from task ${taskId} to task ${newTaskId}`);
              break;
  
            default:
              console.error(`Unknown operation: ${operation}`);
          }
        }
  
        return `Deliverables for task ${taskId} managed successfully.`;
      } catch (error) {
        console.error("Error managing task deliverables:", error);
        return `Error: Unable to manage task deliverable. Error: ${JSON.stringify(error)}`;
      }
    },
  },
  {
    name: "manage_deliverable_content",
    description: "Manages content for a deliverable. Can create new content, update existing content, or fetch content for a deliverable.",
    schema: {
      type: "object",
      properties: {
        operation: {
          type: "string",
          enum: ["create", "update", "fetch"],
          description: "The operation to perform on the deliverable content.",
        },
        deliverableId: {
          type: "string",
          description: "The ID of the deliverable to manage content for.",
        },
        content: {
          type: "string",
          description: "The content of the deliverable (required for create and update operations).",
        },
      },
      required: ["operation", "deliverableId"],
    },
    handler: async ({ operation, deliverableId, content }, userId: string) => {
      console.log(`Managing content for deliverable ${deliverableId}`);
      try {
        const supabase = createClient();
  
        // Check if the deliverable exists and belongs to the user
        const { data: deliverable, error: deliverableError } = await supabase
          .from("deliverables")
          .select("id")
          .eq("id", deliverableId)
          .eq("user_id", userId)
          .single();
  
        if (deliverableError || !deliverable) {
          return `Error: Deliverable with ID "${deliverableId}" not found or doesn't belong to the user.`;
        }
  
        switch (operation) {
          case "create":
            if (!content) {
              return "Error: Content is required for create operation.";
            }
            const htmlContent = marked(content); // Convert Markdown to HTML  
            const { data: createData, error: createError } = await supabase
              .from("deliverable_content")
              .insert({ deliverable_id: deliverableId, content: htmlContent })
              .select()
              .single();
  
            if (createError) throw createError;
            console.log(`Created content for deliverable ${deliverableId}`);
            return `Content created successfully for deliverable ${deliverableId}. Content ID: ${createData.id}`;
  
          case "update":
            if (!content) {
              return "Error: Content is required for update operation.";
            }
            const updateHtmlContent = marked(content); // Convert Markdown to HTML  
            const { data: updateData, error: updateError } = await supabase
              .from("deliverable_content")
              .update({ content: updateHtmlContent })
              .eq("deliverable_id", deliverableId)
              .select()
              .single();
  
            if (updateError) throw updateError;
            console.log(`Updated content for deliverable ${deliverableId}`);
            return `Content updated successfully for deliverable ${deliverableId}. Content ID: ${updateData.id}`;
  
          case "fetch":
            const { data: fetchData, error: fetchError } = await supabase
              .from("deliverable_content")
              .select("content")
              .eq("deliverable_id", deliverableId)
              .single();
  
            if (fetchError) throw fetchError;
            console.log(`Fetched content for deliverable ${deliverableId}`);
            return fetchData ? fetchData.content : "No content found for this deliverable.";
  
          default:
            return `Error: Unknown operation ${operation}`;
        }
      } catch (error) {
        console.error("Error managing deliverable content:", error);
        return `Error: Unable to manage deliverable content. ${error}`;
      }
    },
  }, 
  // {
  //   name: "add_column",
  //   description: "Adds a new column for the user.",
  //   schema: {
  //     type: "object",
  //     properties: {
  //       title: {
  //         type: "string",
  //         description: "The title of the new column.",
  //       },
  //     },
  //     required: ["title"],
  //   },
  //   handler: async ({ title }: { title: string }, userId: string) => {
  //     console.log(`Adding column with title: ${title}`);
  //     try {
  //       const supabase = createClient();
  //       const { data, error } = await supabase
  //         .from("columns")
  //         .insert({ title, user_id: userId })
  //         .select();

  //       if (error) throw error;
  //       console.log("Column added successfully:", data);
  //       return `Column "${title}" added successfully.`;
  //     } catch (error) {
  //       console.error("Error adding column:", error);
  //       return `Error: Unable to add column. ${error}`;
  //     }
  //   },
  // },
  // {
  //   name: "delete_column",
  //   description: "Deletes a column and its associated tasks.",
  //   schema: {
  //     type: "object",
  //     properties: {
  //       columnId: {
  //         type: "string",
  //         description: "The ID of the column to delete.",
  //       },
  //     },
  //     required: ["columnId"],
  //   },
  //   handler: async ({ columnId }: { columnId: string }, userId: string) => {
  //     console.log(`Deleting column with ID: ${columnId}`);
  //     try {
  //       const supabase = createClient();
  //       // First, delete all tasks associated with this column
  //       const { error: tasksError } = await supabase
  //         .from("tasks")
  //         .delete()
  //         .eq("column_id", columnId);

  //       if (tasksError) throw tasksError;

  //       // Then, delete the column itself
  //       const { error: columnError } = await supabase
  //         .from("columns")
  //         .delete()
  //         .eq("id", columnId);

  //       if (columnError) throw columnError;

  //       console.log("Column and associated tasks deleted successfully");
  //       return `Column with ID "${columnId}" and its associated tasks deleted successfully.`;
  //     } catch (error) {
  //       console.error("Error deleting column:", error);
  //       return `Error: Unable to delete column. ${error}`;
  //     }
  //   },
  // },
  // {
  //   name: "update_column",
  //   description: "Updates a column.",
  //   schema: {
  //     type: "object",
  //     properties: {
  //       columnId: {
  //         type: "string",
  //         description: "The ID of the column to update.",
  //       },
  //       title: {
  //         type: "string",
  //         description: "The new title of the column.",
  //       },
  //       description: {
  //         type: "string",
  //         description: "The new description of the column.",
  //       },
  //     },
  //     required: ["columnId", "title", "description"],
  //   },
  //   handler: async ({ columnId, title, description }: { columnId: string; title: string; description: string }, userId: string) => {
  //     console.log(`Updating column with ID: ${columnId}`);
  //     try {
  //       const supabase = createClient();
  //       const { error } = await supabase
  //         .from("columns")
  //         .update({ title, description })
  //         .eq("id", columnId);

  //       if (error) throw error;
  //       console.log("Column updated successfully");
  //       return `Column with ID "${columnId}" updated successfully.`;
  //     } catch (error) {
  //       console.error("Error updating column:", error);
  //       return `Error: Unable to update column. ${error}`;
  //     }
  //   },
  // },
  // {
  //   name: "fetch_columns",
  //   description: "Fetches all columns for the user.",
  //   schema: {
  //     type: "object",
  //     properties: {},
  //     required: [],
  //   },
  //   handler: async ( userId: string) => {
  //     console.log("Fetching columns");
  //     try {
  //       const supabase = createClient();
  //       const { data, error } = await supabase
  //         .from("columns")
  //         .select("*");

  //       if (error) throw error;
  //       console.log("Columns fetched successfully:", data);
  //       return JSON.stringify(data);
  //     } catch (error) {
  //       console.error("Error fetching columns:", error);
  //       return `Error: Unable to fetch columns. ${error}`;
  //     }
  //   },
  // },
  // {
  //   name: "fetch_tasks",
  //   description: "Fetches all tasks for the user.",
  //   schema: {
  //     type: "object",
  //     properties: {},
  //     required: [],
  //   },
  //   handler: async ( userId: string) => {
  //     console.log("Fetching tasks");
  //     try {
  //       const supabase = createClient();
  //       const { data, error } = await supabase
  //         .from("tasks")
  //         .select("*");

  //       if (error) throw error;
  //       console.log("Tasks fetched successfully:", data);
  //       return JSON.stringify(data);
  //     } catch (error) {
  //       console.error("Error fetching tasks:", error);
  //       return `Error: Unable to fetch tasks. ${error}`;
  //     }
  //   },
  // },
];


// Convert tools to Anthropic format
const anthropicTools: Anthropic.Messages.Tool[] = tools.map((tool) => ({
  name: tool.name,
  description: tool.description,
  input_schema: tool.schema,
}));

async function processFiles(files: File[]): Promise<string> {
  const fileContents = await Promise.all(
    files.map(async (file) => {
      const text = await file.text();
      return `File: ${file.name}\nContent:\n${text}\n\n`;
    })
  );
  return fileContents.join("");
}

async function updateUserCost(
  supabase: ReturnType<typeof createClient>, // Add this parameter
  userId: string,
  totalCost: number
): Promise<void> {
  try {
    // Get user current incurred total cost
    const { data, error } = await supabase
      .from('profiles')
      .select('api_cost_chat')
      .eq('id', userId)
      .single()

    if (error) throw error

    const currentCost = data?.api_cost_chat || 0

    // Add total cost to current cost
    const updatedCost = currentCost + totalCost

    // Update user cost in the database
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ api_cost_chat: updatedCost })
      .eq('id', userId)

    if (updateError) throw updateError
  } catch (error) {
    console.error("Error updating user API cost:", error)
    throw error  // Re-throw the error for the caller to handle if needed
  }
}

async function processChunks(
  stream: AsyncIterable<any>,
  anthropic: Anthropic,
  anthropicMessages: any[],
  encoder: TextEncoder,
  controller: ReadableStreamDefaultController,
  supabase: ReturnType<typeof createClient>,
  userId: string,
  totalInputTokens: number = 0,
  totalOutputTokens: number = 0,
  isTopLevelCall: boolean = true  // New parameter
) {
  let isClosed = false;
  let currentToolUse: any = null;
  let currentToolInput = "";
  let currentResponseText = "";

  try {
    for await (const chunk of stream) {
      console.log("chunk", chunk);
      if (chunk.type === "message_start") {
        totalInputTokens += chunk.message.usage.input_tokens;
        console.log(`Message start: input tokens = ${totalInputTokens}`);
      } else if (chunk.type === "message_delta") {
        totalOutputTokens += chunk.usage.output_tokens;
        console.log(`Message delta: output tokens = ${totalOutputTokens}`);
      }

      if (
        chunk.type === "content_block_delta" &&
        chunk.delta.type === "text_delta"
      ) {
        currentResponseText += chunk.delta.text;
        console.log(`Text delta: ${chunk.delta.text}`);
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(chunk.delta.text)}\n\n`)
        );
      }

      if (
        chunk.type === "content_block_start" &&
        chunk.content_block.type === "tool_use"
      ) {
        currentToolUse = chunk.content_block;
        currentToolInput = "";
        console.log(`Tool use started: ${currentToolUse.name}`);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "tool_call",
              tool: currentToolUse.name,
            })}\n\n`
          )
        );
      } else if (
        chunk.type === "content_block_delta" &&
        chunk.delta.type === "input_json_delta"
      ) {
        currentToolInput += chunk.delta.partial_json;
        console.log(`Input JSON delta: ${chunk.delta.partial_json}`);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "tool_payload",
              payload: chunk.delta.partial_json,
            })}\n\n`
          )
        );
      } else if (chunk.type === "content_block_stop" && currentToolUse) {
        try {
          console.log(`Tool use stopped: ${currentToolUse.name}`);
          const toolInput = currentToolInput ? JSON.parse(currentToolInput) : {};
          const tool = tools.find((t) => t.name === currentToolUse.name);

          if (tool) {
            console.log(`Executing tool handler: ${tool.name}`);
            const toolResult = await tool.handler(toolInput, userId);
            console.log(`Tool result: ${toolResult}`);

            // Stream tool result to client
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "tool_result",
                  tool: currentToolUse.name,
                  result: toolResult,
                })}\n\n`
              )
            );

            anthropicMessages.push({
              role: "assistant",
              content: [
                { type: "text", text: currentResponseText },
                {
                  type: currentToolUse.type,
                  id: currentToolUse.id,
                  name: currentToolUse.name,
                  input: toolInput,
                },
              ],
            });

            anthropicMessages.push({
              role: "user",
              content: [
                {
                  type: "tool_result",
                  tool_use_id: currentToolUse.id,
                  content: toolResult,
                },
              ],
            });

            console.log(`Updated messages: ${JSON.stringify(anthropicMessages)}`);

            // Create a new message to process the tool result
            const toolResultResponse = await anthropic.messages.create({
              model: "claude-3-5-sonnet-20240620",
              max_tokens: 1000,
              messages: anthropicMessages,
              stream: true,
              tools: anthropicTools,
            });

            // Process the new message stream
            await processChunks(
              toolResultResponse,
              anthropic,
              anthropicMessages,
              encoder,
              controller,
              supabase,
              userId,
              totalInputTokens,
              totalOutputTokens,
              false  // This is not the top-level call
            );
          }

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "tool_finished",
                tool: currentToolUse.name,
              })}\n\n`
            )
          );
        } catch (error) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "tool_error",
                tool: currentToolUse.name,
                error: error instanceof Error ? error.message : String(error),
              })}\n\n`
            )
          );
        }

        currentToolUse = null;
        currentToolInput = "";
        currentResponseText = "";
      }
    }

    console.log("Stream processing completed!");

    // Calculate and log totals
    const inputCost = (totalInputTokens / 1_000_000) * INPUT_TOKEN_COST;
    const outputCost = (totalOutputTokens / 1_000_000) * OUTPUT_TOKEN_COST;
    const totalCost = inputCost + outputCost;

    console.log(`Total input tokens: ${totalInputTokens}`);
    console.log(`Total output tokens: ${totalOutputTokens}`);
    console.log(`Total cost: ${totalCost}`);

    if (!isClosed) {
      try {
        await updateUserCost(supabase, userId, totalCost);
        console.log("Attempting to enqueue final cost data");
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              totalInputTokens,
              totalOutputTokens,
              totalCost,
            })}\n\n`
          )
        );
      } catch (error) {
        console.error("Error enqueuing final cost data:", error);
      }

      // Only send DONE message and close controller if this is the top-level call
      if (isTopLevelCall) {
        try {
          console.log("Attempting to enqueue DONE message");
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } catch (error) {
          console.error("Error enqueuing DONE message:", error);
        }

        try {
          console.log("Attempting to close controller");
          controller.close();
          isClosed = true;
        } catch (closeError) {
          console.error("Error closing controller:", closeError);
        }
      }
    }
  } catch (error) {
    console.error("Error in processChunks:", error);
    if (!isClosed) {
      try {
        console.log("Attempting to enqueue error message");
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              error: "An error occurred while processing the response",
            })}\n\n`
          )
        );
      } catch (enqueueError) {
        console.error("Error enqueuing error message:", enqueueError);
      }
    }
  }
}

export async function POST(req: NextRequest) {
  console.log("new request");
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const formData = await req.formData();
  const messages = JSON.parse(formData.get("messages") as string);
  const projectId = formData.get("projectId") as string;
  const nestedData = JSON.parse(formData.get("nestedData") as string);
  const files = formData.getAll("files") as File[];

  console.log("projectId", projectId);
  console.log("nestedData", nestedData);

  const fileContent = await processFiles(files);
  const lastUserMessage = messages[messages.length - 1];
  lastUserMessage.content += "\n\n" + fileContent;

  // Append projectId and nestedData to the system message
  const appendedSystemMessage = `${SYSTEM_MESSAGE}\n\nProject Data:\n${JSON.stringify({
    projectId,
    columns: nestedData,
  }, null, 2)}`;

  console.log("appendedSystemMessage", appendedSystemMessage);

  // Prepare messages for Anthropic API
  const anthropicMessages = prepareAnthropicMessages(messages);


  const stream = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20240620",
    max_tokens: 3000,
    temperature: 0,
    messages: anthropicMessages,
    stream: true,
    tools: anthropicTools,
    system: appendedSystemMessage,
  });

  const encoder = new TextEncoder();

  const customReadable = new ReadableStream({
    async start(controller) {
      try {
        await processChunks(
          stream,
          anthropic,
          anthropicMessages,
          encoder,
          controller,
          supabase,
          user.id,
          0,  // totalInputTokens
          0,  // totalOutputTokens
          true  // This is the top-level call
        );
      } catch (error) {
        console.error("Error in stream processing:", error);
        if (!controller.desiredSize) {
          controller.error(error);
        }
      }
    },
  });

  return new Response(customReadable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

function prepareAnthropicMessages(messages: any[]): Anthropic.Messages.MessageParam[] {
  const anthropicMessages: Anthropic.Messages.MessageParam[] = [];
  
  for (const message of messages) {
    if (message.role === "user") {
      anthropicMessages.push({
        role: "user",
        content: [{ type: "text", text: message.content }],
      });
    } else if (message.role === "assistant") {
      // Combine all assistant messages into a single message
      const lastAssistantMessage = anthropicMessages[anthropicMessages.length - 1];
      if (lastAssistantMessage && lastAssistantMessage.role === "assistant") {
        if (Array.isArray(lastAssistantMessage.content)) {
          lastAssistantMessage.content.push({ type: "text", text: message.content });
        } else {
          lastAssistantMessage.content = [
            { type: "text", text: lastAssistantMessage.content },
            { type: "text", text: message.content },
          ];
        }
      } else {
        anthropicMessages.push({
          role: "assistant",
          content: [{ type: "text", text: message.content }],
        });
      }
    }
  }

  return anthropicMessages;
}