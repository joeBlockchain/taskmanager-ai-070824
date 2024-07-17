import { SiteHeader } from "@/components/site-header";
import Kanban from "./kanaban";
import Chat from "@/components/chat/chat";
import { Separator } from "@/components/ui/separator";

export default function Page() {
  return (
    <main className="w-full">
      {/* <SiteHeader /> */}
      <div className="flex flex-row">
        <div className="w-3/4 border-r border-border mr-4">
          <Kanban />
        </div>

        <div className="w-1/4 h-[calc(100vh-3rem)]">
          <Chat />
        </div>
      </div>
    </main>
  );
}
