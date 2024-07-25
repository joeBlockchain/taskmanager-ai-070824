//import next stuff
import Link from "next/link";

//import shadcnui stuff
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="w-full py-[5rem]">
      <div className="">
        <div className="flex flex-col justify-center space-y-4">
          <div className="mx-3 space-y-2 lg:space-y-3 max-w-md md:max-w-2xl lg:max-w-3xl">
            <h1 className="leading-tight lg::leading-snug font-black text-5xl lg:text-7xl ">
              Supercharge Your Productivity with AI
            </h1>
            <p className="leading-normal text-xl text-muted-foreground">
              TaskManager-AI is the ultimate AI Assisted task management
              solution to streamline your workflow, boost productivity, and
              ensure your success.
            </p>
          </div>
          <div className="flex flex-row items-center space-x-4 pt-4">
            <Button
              asChild
              variant="default"
              className="mx-3 w-40 text-lg h-12 lg:h-14 lg:rounded-lg lg:text-xl"
            >
              <Link href="/signin/password_signin">Get Started</Link>
            </Button>
            {/* <Button
              asChild
              variant="outline"
              className="mx-3 w-40 text-lg h-12 lg:h-14 lg:rounded-xl lg:text-xl"
            >
              <Link href="/login">Learn More</Link>
            </Button> */}
          </div>
        </div>
      </div>
    </section>
  );
}
