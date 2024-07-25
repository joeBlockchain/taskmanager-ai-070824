import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation"; // Import redirect function
import { SiteHeader } from "@/components/site-header";
import { Hero } from "@/components/ui/Landing/hero";
import Chat from "@/components/chat/chat";
import Kanban from "@/components/kanban/kanaban";

export default async function Home() {
  const supabase = createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (user) {
    // Redirect to /workspace/projects if user is authenticated
    redirect("/workspace/projects");
  }

  return (
    <main className="mx-5">
      <nav className="">
        <SiteHeader />
      </nav>
      <Hero />
    </main>
  );
}
