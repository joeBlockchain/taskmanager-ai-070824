// app/(workspace)/workspace/projects/layout.tsx

import { SiteHeader } from "@/components/site-header";
import { Footer } from "@/components/ui/Landing/footer";
import { PropsWithChildren } from "react";

export default function ApplicationLayout({ children }: PropsWithChildren) {
  return (
    <div className="">
      {/* Add your application-specific layout components */}
      <nav className="sticky top-0">
        <SiteHeader />
      </nav>
      {children}
      <Footer />
    </div>
  );
}
