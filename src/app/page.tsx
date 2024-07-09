"use client";

import ChatBotButton from "@/components/chat/chat-bot-button";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";

export default function Home() {
  return (
    <main className="">
      <KanbanBoard />
      <ChatBotButton />
    </main>
  );
}
