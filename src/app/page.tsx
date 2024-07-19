import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation"; // Import redirect function
import { SiteHeader } from "@/components/site-header";

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
    <main>
      <nav className="">
        <SiteHeader />
      </nav>
      your on the main page
    </main>
  );
}
