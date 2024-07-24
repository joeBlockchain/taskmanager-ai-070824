import React, { useState, useContext, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { Deliverable } from "@/components/kanban/types";
import { KanbanContext } from "@/components/kanban/kanban-wrapper";
import { useToast } from "@/components/ui/use-toast";
import {
  X,
  PenTool,
  FileEdit,
  Plus,
  Sparkles,
  ChevronDown,
  Scissors,
  StretchHorizontal,
  Eraser,
  Briefcase,
  Coffee,
  ArrowRight,
  Zap,
  Smile,
  MicVocal,
  SpellCheck,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";

const supabase = createClient();

interface AIAssistButtonProps {
  deliverable: Deliverable;
  deliverableContent: string;
}

export function AIAssistButton({
  deliverable,
  deliverableContent,
}: AIAssistButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [showResponse, setShowResponse] = useState(false);
  const [hasContent, setHasContent] = useState(false);
  const { toast } = useToast();

  const { columns, tasks, deliverables } = useContext(KanbanContext);

  useEffect(() => {
    setHasContent(deliverableContent.trim().length > 0);
  }, [deliverableContent]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showResponse && !isLoading) {
      timer = setTimeout(() => {
        setShowResponse(false);
        setAiResponse("");
      }, 10000);
    }
    return () => clearTimeout(timer);
  }, [showResponse, isLoading]);

  const handleAIAssist = async (action: string) => {
    setIsLoading(true);
    setShowResponse(true);
    setAiResponse("");

    try {
      const nestedData = columns.map((column) => ({
        ...column,
        tasks: tasks
          .filter((task) => task.column_id === column.id)
          .map((task) => ({
            ...task,
            deliverables: deliverables.filter(
              (deliverable) => deliverable.task_id === task.id
            ),
          })),
      }));

      let prompt = "";
      switch (action) {
        case "complete":
          prompt = `Please complete the deliverable titled: "${deliverable.title}". 
          The current description is: "${deliverable.description}". 
          The current content is: "${deliverableContent}".
          Please provide the full, completed content for this deliverable.`;
          break;
        case "shorten":
          prompt = `Please redraft and shorten the deliverable titled: "${deliverable.title}". 
          The current description is: "${deliverable.description}". 
          The current content is: "${deliverableContent}".
          Please provide a shorter version of the content while maintaining its key points.`;
          break;
        case "lengthen":
          prompt = `Please redraft and lengthen the deliverable titled: "${deliverable.title}". 
          The current description is: "${deliverable.description}". 
          The current content is: "${deliverableContent}".
          Please provide an extended version of the content, adding more detail and depth.`;
          break;
        case "simplify":
          prompt = `Please redraft and simplify the deliverable titled: "${deliverable.title}". 
          The current description is: "${deliverable.description}". 
          The current content is: "${deliverableContent}".
          Please provide a simplified version of the content, making it easier to understand.`;
          break;
        case "fix":
          prompt = `Please redraft the deliverable titled: "${deliverable.title}" by only fixing spelling and grammar. 
          The current description is: "${deliverable.description}". 
          The current content is: "${deliverableContent}".
          Please provide the corrected content without changing its meaning or structure.`;
          break;
        case "professional":
          prompt = `Please redraft the deliverable titled: "${deliverable.title}" to have a more professional tone. 
          The current description is: "${deliverable.description}". 
          The current content is: "${deliverableContent}".
          Please provide the content with a more professional tone.`;
          break;
        case "casual":
          prompt = `Please redraft the deliverable titled: "${deliverable.title}" to have a more casual tone. 
          The current description is: "${deliverable.description}". 
          The current content is: "${deliverableContent}".
          Please provide the content with a more casual tone.`;
          break;
        case "straightforward":
          prompt = `Please redraft the deliverable titled: "${deliverable.title}" to have a more straightforward tone. 
          The current description is: "${deliverable.description}". 
          The current content is: "${deliverableContent}".
          Please provide the content with a more straightforward tone.`;
          break;
        case "confident":
          prompt = `Please redraft the deliverable titled: "${deliverable.title}" to have a more confident tone. 
          The current description is: "${deliverable.description}". 
          The current content is: "${deliverableContent}".
          Please provide the content with a more confident tone.`;
          break;
        case "friendly":
          prompt = `Please redraft the deliverable titled: "${deliverable.title}" to have a more friendly tone. 
          The current description is: "${deliverable.description}". 
          The current content is: "${deliverableContent}".
          Please provide the content with a more friendly tone.`;
          break;
        default:
          prompt = `Please help with the deliverable titled: "${deliverable.title}". 
          The current description is: "${deliverable.description}". 
          The current content is: "${deliverableContent}".
          Please provide suggestions or improvements for this deliverable.`;
      }

      const formData = new FormData();
      formData.append(
        "messages",
        JSON.stringify([{ role: "user", content: prompt }])
      );
      formData.append("deliverableId", deliverable.id);
      formData.append("nestedData", JSON.stringify(nestedData));

      const response = await fetch("/api/anthropic", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No reader available");
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split("\n\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") {
              setIsLoading(false);
              break;
            }
            try {
              const parsedData = JSON.parse(data);
              if (typeof parsedData === "string") {
                setAiResponse((prev) => prev + parsedData);
              }
            } catch (error) {
              console.error("Error parsing data:", error);
              toast({
                title: "Oops!",
                description: "Something went wrong " + error,
              });
            }
          }
        }
      }

      console.log("AI Response:", aiResponse);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Oops!",
        description: "Something went wrong " + error,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseResponse = () => {
    setShowResponse(false);
    setAiResponse("");
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" className="ml-4">
            {isLoading ? (
              <>
                <span
                  className="loader"
                  style={
                    {
                      "--loader-size": "18px",
                      "--loader-color": "#000",
                      "--loader-color-dark": "#fff",
                    } as React.CSSProperties
                  }
                ></span>
                <span className="ml-2">Processing...</span>
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5 flex-none" />
                <span className="">Ask AI</span>
                <ChevronDown className="ml-2 h-4 w-4 flex-none" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {!hasContent ? (
            <DropdownMenuItem onSelect={() => handleAIAssist("complete")}>
              <Plus className="mr-3 h-5 w-5" strokeWidth={1.5} />
              Draft Deliverable
            </DropdownMenuItem>
          ) : (
            <>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <FileEdit className="mr-3 h-5 w-5" strokeWidth={1.5} />
                  <span>Redraft</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem
                      onSelect={() => handleAIAssist("shorten")}
                    >
                      <Scissors className="mr-3 h-5 w-5" strokeWidth={1.5} />
                      Make Shorter
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => handleAIAssist("lengthen")}
                    >
                      <StretchHorizontal
                        className="mr-3 h-5 w-5"
                        strokeWidth={1.5}
                      />
                      Make Longer
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => handleAIAssist("simplify")}
                    >
                      <Eraser className="mr-3 h-5 w-5" strokeWidth={1.5} />
                      Simplify
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleAIAssist("fix")}>
                      <SpellCheck className="mr-3 h-5 w-5" strokeWidth={1.5} />
                      Only Fix Spelling & Grammar
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <MicVocal className="mr-3 h-5 w-5" strokeWidth={1.5} />
                  <span className="mr-2">Revise Tone</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem
                      onSelect={() => handleAIAssist("professional")}
                    >
                      <Briefcase className="mr-3 h-5 w-5" strokeWidth={1.5} />
                      More Professional
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleAIAssist("casual")}>
                      <Coffee className="mr-3 h-5 w-5" strokeWidth={1.5} />
                      More Casual
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => handleAIAssist("straightforward")}
                    >
                      <ArrowRight className="mr-3 h-5 w-5" strokeWidth={1.5} />
                      More Straightforward
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => handleAIAssist("confident")}
                    >
                      <Zap className="mr-3 h-5 w-5" strokeWidth={1.5} />
                      More Confident
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => handleAIAssist("friendly")}
                    >
                      <Smile className="mr-3 h-5 w-5" strokeWidth={1.5} />
                      More Friendly
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {showResponse && (
        <div
          className="fixed bottom-4 right-4 bg-background border border-border p-4 rounded-lg shadow-lg max-w-md max-h-screen overflow-auto text-base sm:text-sm"
          style={{ zIndex: 1000 }}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleCloseResponse}
          >
            <X className="h-4 w-4" />
          </Button>
          <p className="whitespace-pre-wrap">{aiResponse}</p>
        </div>
      )}
    </>
  );
}
