// app/(workspace)/workspace/projects/layout.tsx

import AuthButton from "@/components/ui/auth-button";
import { ArrowLeft, Coffee, CoffeeIcon } from "lucide-react";
import Link from "next/link";
import { PropsWithChildren } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function ApplicationLayout({ children }: PropsWithChildren) {
  return (
    <div className="p-4">
      {/* Add your application-specific layout components */}
      {/* <nav> </nav> */}
      <div className="flex flex-row items-center justify-between mb-4">
        <div className="flex flex-row items-center text-center space-x-4">
          <h1 className="hidden sm:block text-2xl font-bold text-center">
            Projects
          </h1>
        </div>
        <div className="flex flex-row items-center text-center space-x-4">
          <AuthButton size="small" />
        </div>
      </div>
      {children}
      {/* <footer></footer> */}
    </div>
  );
}
