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
  console.log("user", user);

  const { data: todos } = await supabase
    .from("todos")
    .select("id, task, is_complete, inserted_at");
  console.log("todos", todos);

  const channels = supabase
    .channel("custom-all-channel")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "todos" },
      (payload) => {
        console.log("Change received!", payload);
      }
    )
    .subscribe();

  return (
    <main>
      <nav className="mb-4">
        <SiteHeader />
      </nav>

      <table className="min-w-full divide-y divide-border">
        <thead className="bg-secondary/20">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
            >
              ID
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
            >
              Task
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
            >
              Is Complete
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
            >
              Inserted At
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {todos?.map((todo) => (
            <tr key={todo.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                {todo.id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                {todo.task}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                {todo.is_complete ? "Yes" : "No"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                {new Date(todo.inserted_at).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* {user?.id && <KanbanBoard userId={user.id} />}
      <ChatBotButton /> */}
    </main>
  );
}
