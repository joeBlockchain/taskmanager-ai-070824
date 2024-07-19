// app/(workspace)/workspace/projects/layout.tsx

import AuthButton from "@/components/ui/auth-button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PropsWithChildren } from "react";

export default function ApplicationLayout({ children }: PropsWithChildren) {
  return (
    <div>
      {/* Add your application-specific layout components */}
      {/* <nav> </nav> */}
      <div className="flex flex-row items-center justify-between my-4">
        <div className="flex flex-row items-center text-center space-x-4">
          <h1 className="text-2xl font-bold text-center">Projects</h1>
        </div>
        <AuthButton />
      </div>
      {children}
      {/* <footer></footer> */}
    </div>
  );
}
