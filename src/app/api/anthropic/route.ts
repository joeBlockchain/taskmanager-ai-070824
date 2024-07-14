import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/utils/supabase/server";

import {
  createColumn,
  updateColumn,
  deleteColumn,
  createTask,
  updateTask,
  deleteTask,
} from "@/components/kanban/tools";

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
  properties: Record<string, { type: string; description: string }>;
  required: string[];
};

type Tool = {
  name: string;
  description: string;
  schema: ToolSchema;
  handler: (input: any, userId: string) => Promise<string>;
};

// Define tools
const createTools = (userId: string): Tool[] => [
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
    name: "summarize_url",
    description: "Summarizes the content of a given URL using Jina AI Reader.",
    schema: {
      type: "object",
      properties: {
        url: { type: "string", description: "The URL to summarize." },
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
    name: "create_column",
    description: "Creates a new column with the given title.",
    schema: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "The title of the new column.",
        },
      },
      required: ["title"],
    },
    handler: async ({ title }: { title: string }, userId: string) => {
      const newColumn = await createColumn(title, userId);
      return JSON.stringify(newColumn);
    },
  },
  {
    name: "update_column",
    description: "Updates the title of an existing column.",
    schema: {
      type: "object",
      properties: {
        column_id: {
          type: "string",
          description: "The ID of the column to update.",
        },
        new_title: {
          type: "string",
          description: "The new title of the column.",
        },
      },
      required: ["column_id", "new_title"],
    },
    handler: async (
      { column_id, new_title }: { column_id: string; new_title: string },
      userId: string
    ) => {
      const updatedColumn = await updateColumn(column_id, new_title);
      return updatedColumn ? JSON.stringify(updatedColumn) : "Column not found";
    },
  },
  {
    name: "delete_column",
    description: "Deletes a column with the given ID.",
    schema: {
      type: "object",
      properties: {
        column_id: {
          type: "string",
          description: "The ID of the column to delete.",
        },
      },
      required: ["column_id"],
    },
    handler: async ({ column_id }: { column_id: string }, userId: string) => {
      const result = await deleteColumn(column_id);
      return result ? "Column deleted successfully" : "Column not found";
    },
  },
  {
    name: "create_task",
    description: "Creates a new task in the specified column.",
    schema: {
      type: "object",
      properties: {
        column_id: {
          type: "string",
          description: "The ID of the column to add the task to.",
        },
        title: {
          type: "string",
          description: "The title of the new task.",
        },
        content: {
          type: "string",
          description: "The content of the new task.",
        },
      },
      required: ["column_id", "title", "content"],
    },
    handler: async (
      {
        column_id,
        title,
        content,
      }: { column_id: string; title: string; content: string },
      userId: string
    ) => {
      const newTask = await createTask(column_id, title, content, userId);
      return JSON.stringify(newTask);
    },
  },
  {
    name: "update_task",
    description: "Updates the title and content of an existing task.",
    schema: {
      type: "object",
      properties: {
        task_id: {
          type: "string",
          description: "The ID of the task to update.",
        },
        new_title: {
          type: "string",
          description: "The new title of the task.",
        },
        new_content: {
          type: "string",
          description: "The new content of the task.",
        },
      },
      required: ["task_id", "new_title", "new_content"],
    },
    handler: async (
      {
        task_id,
        new_title,
        new_content,
      }: { task_id: string; new_title: string; new_content: string },
      userId: string
    ) => {
      const updatedTask = await updateTask(task_id, new_title, new_content);
      return updatedTask ? JSON.stringify(updatedTask) : "Task not found";
    },
  },
  {
    name: "delete_task",
    description: "Deletes a task with the given ID.",
    schema: {
      type: "object",
      properties: {
        task_id: {
          type: "string",
          description: "The ID of the task to delete.",
        },
      },
      required: ["task_id"],
    },
    handler: async ({ task_id }: { task_id: string }, userId: string) => {
      const result = await deleteTask(task_id);
      return result ? "Task deleted successfully" : "Task not found";
    },
  },
];

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
  userId: string,
  totalCost: number
): Promise<void> {
  try {
    const currentCost = 0;
    const updatedCost = currentCost + totalCost;

    //call supabase function to update user cost
  } catch (error) {
    console.error("Error updating user metadata:", error);
  }
}

export async function POST(req: NextRequest) {
  //check auth from supabase db
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
  const files = formData.getAll("files") as File[];

  const fileContent = await processFiles(files);
  const lastUserMessage = messages[messages.length - 1];
  lastUserMessage.content += "\n\n" + fileContent;

  const anthropicMessages = messages.map((msg: any) => ({
    role: msg.role,
    content: [{ type: "text", text: msg.content }],
  }));

  const tools = createTools(user.id);
  const anthropicTools: Anthropic.Messages.Tool[] = tools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    input_schema: tool.schema,
  }));

  const stream = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20240620",
    max_tokens: 3000,
    temperature: 0,
    messages: anthropicMessages,
    stream: true,
    tools: anthropicTools,
    system: SYSTEM_MESSAGE,
  });

  const encoder = new TextEncoder();
  let totalInputTokens = 0;
  let totalOutputTokens = 0;

  const customReadable = new ReadableStream({
    async start(controller) {
      let currentToolUse: any = null;
      let currentToolInput = "";
      let currentResponseText = "";

      for await (const chunk of stream) {
        if (chunk.type === "message_start") {
          totalInputTokens = chunk.message.usage.input_tokens;
        } else if (chunk.type === "message_delta") {
          totalOutputTokens = chunk.usage.output_tokens;
        }

        if (
          chunk.type === "content_block_delta" &&
          chunk.delta.type === "text_delta"
        ) {
          currentResponseText += chunk.delta.text;
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
        } else if (
          chunk.type === "content_block_delta" &&
          chunk.delta.type === "input_json_delta"
        ) {
          currentToolInput += chunk.delta.partial_json;
        } else if (chunk.type === "content_block_stop" && currentToolUse) {
          try {
            const toolInput = JSON.parse(currentToolInput);
            console.log("Tool input:", toolInput);
            const tool = tools.find((t) => t.name === currentToolUse.name);

            if (tool) {
              const toolResult = await tool.handler(toolInput, user.id);
              console.log("Tool result:", toolResult);
              const updatedMessages: Anthropic.Messages.MessageParam[] = [
                ...anthropicMessages,
                {
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
                },
                {
                  role: "user",
                  content: [
                    {
                      type: "tool_result",
                      tool_use_id: currentToolUse.id,
                      content: toolResult,
                    },
                  ],
                },
              ];

              const toolResultResponse = await anthropic.messages.create({
                model: "claude-3-5-sonnet-20240620",
                max_tokens: 1000,
                messages: updatedMessages,
                stream: true,
                tools: anthropicTools,
              });

              for await (const responseChunk of toolResultResponse) {
                if (
                  responseChunk.type === "content_block_delta" &&
                  responseChunk.delta.type === "text_delta"
                ) {
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify(responseChunk.delta.text)}\n\n`
                    )
                  );
                }
                if (responseChunk.type === "message_delta") {
                  totalOutputTokens += responseChunk.usage.output_tokens;
                }
                if (responseChunk.type === "message_start") {
                  totalInputTokens += responseChunk.message.usage.input_tokens;
                }
              }
            }

            currentToolUse = null;
            currentToolInput = "";
          } catch (error) {
            console.error("Error parsing or executing tool input:", error);
          }
        }
      }

      const inputCost = (totalInputTokens / 1_000_000) * INPUT_TOKEN_COST;
      const outputCost = (totalOutputTokens / 1_000_000) * OUTPUT_TOKEN_COST;
      const totalCost = inputCost + outputCost;

      await updateUserCost(user.id, totalCost);

      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({
            inputTokens: totalInputTokens,
            outputTokens: totalOutputTokens,
            inputCost: inputCost.toFixed(6),
            outputCost: outputCost.toFixed(6),
          })}\n\n`
        )
      );

      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
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
