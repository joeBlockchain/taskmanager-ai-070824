import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDown, LogOut, User } from "lucide-react";
import { ModeToggle } from "../mode-toggle";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { CoffeeIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type AuthButtonProps = {
  size?: "default" | "small" | "tiny";
};

export default async function AuthButton({
  size = "default",
}: AuthButtonProps) {
  const supabase = createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  const signOut = async () => {
    "use server";

    const supabase = createClient();
    await supabase.auth.signOut();
    return redirect("/");
  };

  let { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("api_cost_chat");

  console.log(profiles);

  const avatarSizeClass =
    size === "tiny" ? "w-5 h-5" : size === "small" ? "w-7 h-7" : "w-10 h-10";

  // Calculate the API cost as a multiple of 5
  // Calculate the API cost progress
  const apiCost =
    profiles && profiles[0]?.api_cost_chat ? profiles[0].api_cost_chat : 0;
  const progressPercentage = (apiCost / 15) * 100; // 5 represents 100%
  const displayValue = Math.round((progressPercentage / 100) * 1500); // Convert to a value out of 500

  console.log(progressPercentage);

  return user ? (
    <div className="flex items-center gap-4">
      <Popover>
        <PopoverTrigger>
          <Button
            variant="outline"
            className="hover:bg-secondary/40 flex w-fit"
          >
            <CoffeeIcon className="w-5 h-5 flex-none mr-4" />

            <div className="hidden sm:block text-sm font-medium mr-4">
              <Badge variant="outline">{progressPercentage.toFixed(0)}%</Badge>
            </div>
            <Progress value={progressPercentage} className="h-2 w-[100px]" />
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          Let me buy you a cup of coffee! You are{" "}
          <Badge>{progressPercentage.toFixed(0)}%</Badge> of the way there...
          <br />
          <br />
          Type in a few more AI tasks to see where we can improve!
        </PopoverContent>
      </Popover>
      <ModeToggle />
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="w-full">
          <Button
            variant="ghost"
            className="w-full flex flex-row justify-between items-center gap-2"
          >
            <div className="flex flex-row items-center gap-4">
              <Avatar className={avatarSizeClass}>
                <AvatarImage
                  src={user.user_metadata.avatar_url}
                  alt={user.user_metadata.name}
                />
                <AvatarFallback>
                  <User className="" />
                </AvatarFallback>
              </Avatar>
              <p className="">{user.user_metadata.full_name}</p>
            </div>
            <ChevronDown
              strokeWidth={1}
              className="w-5 h-5 text-muted-foreground"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[20rem]">
          <DropdownMenuLabel>
            <div className="flex items-center gap-5">
              <Avatar className={avatarSizeClass}>
                <AvatarImage
                  src={user.user_metadata.avatar_url}
                  alt={user.user_metadata.name}
                />
                <AvatarFallback>
                  <User className="" />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <div>{user.user_metadata.full_name}</div>
                <div className="text-sm text-muted-foreground">
                  {user.email}
                </div>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <form action={signOut}>
              <Button
                variant="ghost"
                type="submit"
                className="flex items-left gap-5"
              >
                <LogOut className="mx-2" />
                <div className="flex flex-col items-start justify-start">
                  <div>Sign out</div>
                  <div className="text-sm text-muted-foreground">
                    Catch you on the flip side!
                  </div>
                </div>
              </Button>
            </form>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ) : (
    <div className="flex items-center gap-4">
      <ModeToggle />
      <Button variant="link" asChild className="">
        <Link href="/signin">Sign in</Link>
      </Button>
    </div>
  );
}
