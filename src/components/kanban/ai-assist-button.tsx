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
  DollarSign,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PenSquare } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Accordion,
  AccordionContent,
  AccordionTrigger,
  AccordionItem,
} from "@/components/ui/accordion";

const supabase = createClient();

interface AIAssistButtonProps {
  deliverable: Deliverable;
  deliverableContent: string;
}

interface StreamingResponse {
  type: string;
  content: string;
}

interface CostData {
  totalInputTokens: number;
  totalOutputTokens: number;
  inputCost: number;
  outputCost: number;
  totalCost: number;
}

export function AIAssistButton({
  deliverable,
  deliverableContent,
}: AIAssistButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<StreamingResponse[]>([]);
  const [showResponse, setShowResponse] = useState(false);
  const [hasContent, setHasContent] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [isCustomPromptOpen, setIsCustomPromptOpen] = useState(false);
  const [dependencyContent, setDependencyContent] = useState("");
  const [costData, setCostData] = useState<CostData | null>(null);
  const [accumulatedCost, setAccumulatedCost] = useState<number>(0);

  const { toast } = useToast();

  const { columns, tasks, deliverables } = useContext(KanbanContext);

  useEffect(() => {
    setHasContent(deliverableContent.trim().length > 0);
  }, [deliverableContent]);

  // useEffect(() => {
  //   let timer: NodeJS.Timeout;
  //   if (showResponse && !isLoading) {
  //     timer = setTimeout(() => {
  //       setShowResponse(false);
  //       setAiResponse([]);
  //     }, 10000);
  //   }
  //   return () => clearTimeout(timer);
  // }, [showResponse, isLoading]);

  const handleCustomPromptSubmit = () => {
    handleAIAssist("custom", customPrompt);
    setIsCustomPromptOpen(false);
    setCustomPrompt("");
  };

  useEffect(() => {
    setHasContent(deliverableContent.trim().length > 0);
    fetchAccumulatedCost();
  }, [deliverableContent]);

  const fetchAccumulatedCost = async () => {
    try {
      const { data, error } = await supabase
        .from("deliverable_content")
        .select("api_cost_chat")
        .eq("deliverable_id", deliverable.id)
        .single();

      if (error) throw error;

      setAccumulatedCost(data.api_cost_chat || 0);
    } catch (error) {
      console.error("Error fetching accumulated cost:", error);
      toast({
        title: "Error",
        description: "Failed to fetch accumulated cost",
      });
    }
  };

  const updateAccumulatedCost = async (newCost: number) => {
    const updatedCost = accumulatedCost + newCost;
    try {
      const { error } = await supabase
        .from("deliverable_content")
        .update({ api_cost_chat: updatedCost })
        .eq("deliverable_id", deliverable.id);

      if (error) throw error;

      setAccumulatedCost(updatedCost);
    } catch (error) {
      console.error("Error updating accumulated cost:", error);
      toast({
        title: "Error",
        description: "Failed to update accumulated cost",
      });
    }
  };

  useEffect(() => {
    if (deliverable.dependency_deliverable_id) {
      const fetchDependencyContent = async () => {
        setDependencyContent("");
        try {
          const { data, error } = await supabase
            .from("deliverable_content")
            .select("*")
            .eq("deliverable_id", deliverable.dependency_deliverable_id)
            .single();

          if (error) throw error;
          setDependencyContent(data.content);
        } catch (error) {
          console.error("Error fetching dependency deliverable:", error);
          return null;
        }
      };

      fetchDependencyContent();
    }
  }, [deliverable.dependency_deliverable_id]);

  const handleAIAssist = async (action: string, customPrompt: string = "") => {
    setIsLoading(true);
    setShowResponse(true);
    setAiResponse([]);
    setCostData(null);

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
        case "custom":
          prompt = `Please help with the deliverable titled: "${
            deliverable.title
          }". 
          The current description is: "${deliverable.description}". 
          The current content is [no need to fetch anything]: "${
            deliverableContent ||
            "This is my current content... I'm not where where to start."
          }".
          The dependency content is: "${
            dependencyContent ||
            "There is no dependency content.  The dependency content is blank in the database."
          }".
          Custom request: ${customPrompt || "No custom request provided"}`;
          break;
        default:
        case "complete":
          prompt = `Please complete the deliverable titled: "${
            deliverable.title
          }". 
          The current description is: "${deliverable.description}". 
          The current content is [no need to fetch anything]: "${
            deliverableContent ||
            "This is my current content... I'm not where where to start."
          }".
          The dependency content is: "${
            dependencyContent ||
            "There is no dependency content.  The dependency content is blank in the database."
          }".
          Please provide the full, completed content for this deliverable.`;
          break;
        case "shorten":
          prompt = `Please redraft and shorten the deliverable titled: "${
            deliverable.title
          }". 
          The current description is: "${deliverable.description}". 
          The current content is [no need to fetch anything]: "${
            deliverableContent ||
            "This is my current content... I'm not where where to start."
          }".
          The dependency content is: "${
            dependencyContent ||
            "There is no dependency content.  The dependency content is blank in the database."
          }".
          Please provide a shorter version of the content while maintaining its key points.`;
          break;
        case "lengthen":
          prompt = `Please redraft and lengthen the deliverable titled: "${
            deliverable.title
          }". 
          The current description is: "${deliverable.description}". 
          The current content is [no need to fetch anything]: "${
            deliverableContent ||
            "This is my current content... I'm not where where to start."
          }".
          The dependency content is: "${
            dependencyContent ||
            "There is no dependency content.  The dependency content is blank in the database."
          }".
          Please provide an extended version of the content, adding more detail and depth.`;
          break;
        case "simplify":
          prompt = `Please redraft and simplify the deliverable titled: "${
            deliverable.title
          }". 
          The current description is: "${deliverable.description}". 
          The current content is [no need to fetch anything]: "${
            deliverableContent ||
            "This is my current content... I'm not where where to start."
          }".
          The dependency content is: "${
            dependencyContent ||
            "There is no dependency content.  The dependency content is blank in the database."
          }".
          Please provide a simplified version of the content, making it easier to understand.`;
          break;
        case "fix":
          prompt = `Please redraft the deliverable titled: "${
            deliverable.title
          }" by only fixing spelling and grammar. 
          The current description is: "${deliverable.description}". 
          The current content is [no need to fetch anything]: "${
            deliverableContent ||
            "This is my current content... I'm not where where to start."
          }".
          The dependency content is: "${
            dependencyContent ||
            "There is no dependency content.  The dependency content is blank in the database."
          }".
          Please provide the corrected content without changing its meaning or structure.`;
          break;
        case "professional":
          prompt = `Please redraft the deliverable titled: "${
            deliverable.title
          }" to have a more professional tone. 
          The current description is: "${deliverable.description}". 
          The current content is [no need to fetch anything]: "${
            deliverableContent ||
            "This is my current content... I'm not where where to start."
          }".
          The dependency content is: "${
            dependencyContent ||
            "There is no dependency content.  The dependency content is blank in the database."
          }".
          Please provide the content with a more professional tone.`;
          break;
        case "casual":
          prompt = `Please redraft the deliverable titled: "${
            deliverable.title
          }" to have a more casual tone. 
          The current description is: "${deliverable.description}". 
          The current content is [no need to fetch anything]: "${
            deliverableContent ||
            "This is my current content... I'm not where where to start."
          }".
          The dependency content is: "${
            dependencyContent ||
            "There is no dependency content.  The dependency content is blank in the database."
          }".
          Please provide the content with a more casual tone.`;
          break;
        case "straightforward":
          prompt = `Please redraft the deliverable titled: "${
            deliverable.title
          }" to have a more straightforward tone. 
          The current description is: "${deliverable.description}". 
          The current content is [no need to fetch anything]: "${
            deliverableContent ||
            "This is my current content... I'm not where where to start."
          }".
          The dependency content is: "${
            dependencyContent ||
            "There is no dependency content.  The dependency content is blank in the database."
          }".
          Please provide the content with a more straightforward tone.`;
          break;
        case "confident":
          prompt = `Please redraft the deliverable titled: "${
            deliverable.title
          }" to have a more confident tone. 
          The current description is: "${deliverable.description}". 
          The current content is [no need to fetch anything]: "${
            deliverableContent ||
            "This is my current content... I'm not where where to start."
          }".
          The dependency content is: "${
            dependencyContent ||
            "There is no dependency content.  The dependency content is blank in the database."
          }".
          Please provide the content with a more confident tone.`;
          break;
        case "friendly":
          prompt = `Please redraft the deliverable titled: "${
            deliverable.title
          }" to have a more friendly tone. 
          The current description is: "${deliverable.description}". 
          The current content is [no need to fetch anything]: "${
            deliverableContent ||
            "This is my current content... I'm not where where to start."
          }".
          The dependency content is: "${
            dependencyContent ||
            "There is no dependency content.  The dependency content is blank in the database."
          }".
          Please provide the content with a more friendly tone.`;
          break;
      }

      const formData = new FormData();
      formData.append(
        "messages",
        JSON.stringify([{ role: "user", content: prompt }])
      );
      formData.append("deliverableId", deliverable.id);
      formData.append("nestedData", JSON.stringify(nestedData));
      formData.append("enableTools", "true");
      formData.append(
        "toolChoice",
        JSON.stringify({ type: "tool", name: "manage_deliverable_content" })
      );

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
        console.log("chunk", chunk);
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
              if (parsedData.totalInputTokens) {
                // This is cost data
                setCostData(parsedData);
                updateAccumulatedCost(parsedData.totalCost);
              } else if (parsedData.type === "tool_call") {
                setAiResponse((prev) => [
                  ...prev,
                  { type: "tool_call", content: parsedData.tool },
                ]);
              } else if (parsedData.type === "tool_payload") {
                setAiResponse((prev) => {
                  const newResponse = [...prev];
                  const lastItem = newResponse[newResponse.length - 1];
                  if (lastItem && lastItem.type === "tool_payload") {
                    lastItem.content += parsedData.payload;
                  } else {
                    newResponse.push({
                      type: "tool_payload",
                      content: parsedData.payload,
                    });
                  }
                  return newResponse;
                });
              } else if (typeof parsedData === "string") {
                setAiResponse((prev) => [
                  ...prev,
                  { type: "text", content: parsedData },
                ]);
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
    setAiResponse([]);
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
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setIsCustomPromptOpen(true)}>
            <PenSquare className="mr-3 h-5 w-5" strokeWidth={1.5} />
            Custom Prompt
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isCustomPromptOpen} onOpenChange={setIsCustomPromptOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Custom AI Prompt</DialogTitle>
          </DialogHeader>
          <Input
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Enter your custom prompt here..."
          />
          <DialogFooter>
            <Button onClick={handleCustomPromptSubmit}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {showResponse && (
        <div
          className="fixed bottom-4 right-4 bg-background border border-border p-4 rounded-lg shadow-lg w-96 max-h-[calc(100vh-5rem)] overflow-auto text-base sm:text-sm"
          style={{ zIndex: 1000 }}
        >
          <div className="w-full flex justify-between mb-3 items-center">
            <h1 className="text-lg font-bold">AI Response</h1>
            <Button
              variant="outline"
              size="icon"
              className=""
              onClick={handleCloseResponse}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {aiResponse.map((response, index) => (
            <div key={index} className="mb-4">
              {response.type === "tool_call" && (
                <Alert className="">
                  <Accordion className="" type="single" collapsible>
                    <AccordionItem value="item-1" className="border-none">
                      <AccordionTrigger className="">
                        <p className="">Tool Call</p>
                      </AccordionTrigger>
                      <AccordionContent className="">
                        <pre className="whitespace-pre-wrap overflow-x-auto">
                          {response.content}
                        </pre>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </Alert>
              )}
              {response.type === "tool_payload" && (
                <Alert className="">
                  <Accordion type="single" collapsible>
                    <AccordionItem value="item-1" className="border-none">
                      <AccordionTrigger>
                        <p className="">Tool Payload</p>
                      </AccordionTrigger>
                      <AccordionContent>
                        <pre className="whitespace-pre-wrap overflow-x-auto">
                          {response.content}
                        </pre>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </Alert>
              )}
              {response.type === "text" && (
                <Alert className="">
                  <Accordion type="single" collapsible>
                    <AccordionItem value="item-1" className="border-none">
                      <AccordionTrigger>
                        <p className="">Response</p>
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="whitespace-pre-wrap">
                          {response.content}
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </Alert>
              )}
            </div>
          ))}
          {costData && (
            <Alert className="mt-4">
              <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                  <AccordionTrigger>
                    <div className="flex items-center">
                      <p className="">Cost Data</p>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <p>Total Input Tokens: {costData.totalInputTokens}</p>
                      <p>Total Output Tokens: {costData.totalOutputTokens}</p>
                      <p>Input Cost: ${costData.inputCost.toFixed(4)}</p>
                      <p>Output Cost: ${costData.outputCost.toFixed(4)}</p>
                      <p className="font-bold">
                        Total Cost: ${costData.totalCost.toFixed(4)}
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </Alert>
          )}
        </div>
      )}
    </>
  );
}
