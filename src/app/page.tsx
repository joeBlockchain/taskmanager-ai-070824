"use client";

import ChatBotButton from "@/components/chat/chat-bot-button";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import Image from "next/image";

export default function Home() {
  return (
    <main className="">
      <KanbanBoard />
      <ChatBotButton />
    </main>
  );
}
