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

  const avatarSizeClass =
    size === "tiny" ? "w-5 h-5" : size === "small" ? "w-7 h-7" : "w-10 h-10";

  return user ? (
    <div className="flex items-center gap-4">
      <ModeToggle />
      <DropdownMenu>
        <DropdownMenuTrigger className="w-full">
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
          <DropdownMenuItem>
            <form action={signOut}>
              <button type="submit" className="flex items-center gap-5">
                <LogOut className="mx-2" />
                <div className="flex flex-col items-start justify-start">
                  <div>Sign out</div>
                  <div className="text-sm text-muted-foreground">
                    Catch you on the flip side!
                  </div>
                </div>
              </button>
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
