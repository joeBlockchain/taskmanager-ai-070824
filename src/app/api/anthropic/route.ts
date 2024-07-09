import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { clerkClient } from "@clerk/nextjs/server";
import { auth } from "@clerk/nextjs/server";

export const runtime = "edge";

// Define cost constants
const INPUT_TOKEN_COST = 3; // Cost per 1,000,000 input tokens
const OUTPUT_TOKEN_COST = 15; // Cost per 1,000,000 output tokens

export async function POST(req: NextRequest) {
  // Authenticate the user
  const { userId } = auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  // Convert the messages to the format expected by Anthropic
  const anthropicMessages = body.messages.map((msg: any) => ({
    role: msg.role,
    content: [{ type: "text", text: msg.content }],
  }));

  const stream = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20240620",
    max_tokens: 3000,
    temperature: 0,
    messages: anthropicMessages,
    stream: true,
  });

  const encoder = new TextEncoder();
  let totalInputTokens = 0;
  let totalOutputTokens = 0;

  const customReadable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        //extract input tokens
        if (chunk.type === "message_start") {
          totalInputTokens = chunk.message.usage.input_tokens;
        }

        //extract output tokens
        if (chunk.type === "message_delta") {
          totalOutputTokens = chunk.usage.output_tokens;
        }

        if (
          chunk.type === "content_block_delta" &&
          chunk.delta.type === "text_delta"
        ) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(chunk.delta.text)}\n\n`)
          );
        }
      }

      // Calculate costs
      const inputCost = (totalInputTokens / 1_000_000) * INPUT_TOKEN_COST;
      const outputCost = (totalOutputTokens / 1_000_000) * OUTPUT_TOKEN_COST;
      const totalCost = inputCost + outputCost;

      // Update user's metadata with accumulated costs
      try {
        const user = await clerkClient.users.getUser(userId);
        const currentCost = (user.publicMetadata.totalCost as number) || 0;
        const updatedCost = currentCost + totalCost;

        await clerkClient.users.updateUser(userId, {
          publicMetadata: {
            ...user.publicMetadata,
            totalCost: updatedCost,
          },
        });

        console.log("User metadata updated with total cost:", updatedCost);
      } catch (error) {
        console.error("Error updating user metadata:", error);
        // You might want to add some error handling here, such as sending an error response
      }

      // Send the token counts and costs at the end of the stream
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
