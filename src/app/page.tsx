import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation"; // Import redirect function
import { SiteHeader } from "@/components/site-header";
import { Hero } from "@/components/ui/Landing/hero";
import Chat from "@/components/chat/chat";
import Kanban from "@/components/kanban/kanaban";
import Image from "next/image";
import heroImage from "../../public/hero-img.png";
import heroImageSm from "../../public/hero-img-sm.png";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/ui/Landing/footer";
import createContent from "../../public/create-content.gif";

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
      <div className="hidden md:block p-4 bg-secondary/20 rounded-xl border border-white/50">
        <Image
          src={heroImage}
          alt="Application Image"
          width={2000}
          height={2000}
          className="rounded-lg"
        />
      </div>
      <div className="block md:hidden">
        <Image
          src={heroImageSm}
          alt="Application Image"
          width={2000}
          height={2000}
          className="rounded-lg"
        />
      </div>

      <section className="w-full py-16 md:py-20 lg:py-24">
        <div className="container px-4 md:px-6 border border-border p-12 rounded-xl">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-6">
              Minimalist Kanban, Maximum AI
            </h2>
            <p className="max-w-[800px] text-muted-foreground text-lg mb-8">
              TaskManager-AI was built on two core principles:
            </p>
            <div className="text-left grid md:grid-cols-2 gap-8 w-full max-w-4xl">
              <div className="border border-border bg-secondary/30 p-6 rounded-lg ">
                <h3 className="text-xl font-semibold mb-3">1. Simplicity</h3>
                <p>
                  The most basic kanban board with the minimum amount of
                  functionality possible.
                </p>
              </div>
              <div className="border border-border bg-secondary/30 p-6 rounded-lg ">
                <h3 className="text-xl font-semibold mb-3">2. Innovation</h3>
                <p>
                  The most advanced and cutting-edge AI functionality possible.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="w-full justify-center items-center  py-16 md:py-20 lg:py-24">
        <div className="container max-w-6xl px-4 md:px-6">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="max-w-md space-y-4 lg:pr-8">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                How to Get Started with TaskManager-AI
              </h1>
              <p className="text-muted-foreground md:text-xl/relaxed">
                Your comprehensive guide to mastering AI-powered project
                management and boosting productivity
              </p>
              <Link href="/how-to-get-started" className="inline-block mt-4">
                <Button
                  variant="secondary"
                  className="w-40 text-lg h-12 lg:h-14 lg:rounded-lg lg:text-xl"
                >
                  Read the Guide
                </Button>
              </Link>
            </div>
            <figure className="mt-8 lg:mt-0">
              <Image
                src={createContent}
                alt="TaskManager-AI Guide"
                width={600}
                height={500}
                className="rounded-lg shadow-md border border-gray-200"
              />
              <figcaption
                id="caption"
                className="text-center text-muted-foreground"
              >
                You can create a task by clicking the Add Task button.
              </figcaption>
            </figure>
          </div>
        </div>
      </section>
      <section className="w-full py-16 md:py-20 lg:py-24"></section>
      <Footer />
    </main>
  );
}
