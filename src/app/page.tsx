import { createClient } from "@/utils/supabase/server";

import ChatBotButton from "@/components/chat/chat-bot-button";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { SiteHeader } from "@/components/site-header";

export default async function Home() {
  const supabase = createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return (
    <main className="">
      <SiteHeader />
      {user?.id && <KanbanBoard userId={user.id} />}
      <ChatBotButton />
    </main>
  );
}
