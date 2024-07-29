import { useState, useEffect, useCallback } from "react";
import { debounce } from "lodash";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, ChevronDown, ExternalLink, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import {
  Task,
  Deliverable,
  DeliverableContent,
} from "@/components/kanban/types";
import { createClient } from "@/utils/supabase/client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import TipTapEditor from "@/components/editor/tiptap-editor";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useToast } from "@/components/ui/use-toast";
import { AIAssistButton } from "./ai-assist-button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const supabase = createClient();

interface DeliverableContentSheetProps {
  task: Task;
  deliverable: Deliverable;
  onUpdate: (updatedDeliverable: Deliverable) => void;
}

export function DeliverableContentSheet({
  task,
  deliverable,
  onUpdate,
}: DeliverableContentSheetProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editedDeliverable, setEditedDeliverable] =
    useState<Deliverable>(deliverable);
  const [deliverableContent, setDeliverableContent] =
    useState<DeliverableContent | null>(null);
  const [deliverableContentError, setDeliverableContentError] =
    useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [contentToSave, setContentToSave] = useState<string>("");
  const [dependencyCompleted, setDependencyCompleted] = useState<boolean>(true);

  useEffect(() => {
    setEditedDeliverable(deliverable);
  }, [deliverable]);

  useEffect(() => {
    if (isOpen) {
      fetchDeliverableContent();
      checkDependencyStatus();

      const subscription = supabase
        .channel(`deliverable-${deliverable.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "deliverables",
            filter: `id=eq.${deliverable.id}`,
          },
          (payload) => {
            console.log("Deliverable change received!", payload);
            handleDeliverableChange(payload);
          }
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "deliverable_content",
            filter: `deliverable_id=eq.${deliverable.id}`,
          },
          (payload) => {
            console.log("Deliverable content change received!", payload);
            handleDeliverableContentChange(payload);
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [isOpen, deliverable.id]);

  const fetchDeliverableContent = async () => {
    try {
      const { data, error } = await supabase
        .from("deliverable_content")
        .select("*")
        .eq("deliverable_id", deliverable.id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          setDeliverableContent(null);
        } else {
          throw error;
        }
      } else {
        setDeliverableContent(data);
      }
    } catch (error) {
      console.error("Error fetching deliverable content:", error);
      setDeliverableContentError(true);
    }
  };

  const handleDeliverableChange = (payload: any) => {
    const { eventType, new: newDeliverable, old: oldDeliverable } = payload;
    switch (eventType) {
      case "UPDATE":
        setEditedDeliverable(newDeliverable);
        onUpdate(newDeliverable);
        break;
      // Handle other cases if needed
    }
  };

  const handleDeliverableContentChange = (payload: any) => {
    const { eventType, new: newContent, old: oldContent } = payload;
    switch (eventType) {
      case "INSERT":
      case "UPDATE":
        setDeliverableContent(newContent);
        break;
      case "DELETE":
        setDeliverableContent(null);
        break;
    }
  };

  const handleSave = async () => {
    toast({
      title: "Saving deliverable",
      description: "Please wait...",
    });
    try {
      const { data, error } = await supabase
        .from("deliverables")
        .update({
          title: editedDeliverable.title,
          description: editedDeliverable.description,
          status: editedDeliverable.status,
          due_date: editedDeliverable.due_date,
          dependency_deliverable_id:
            editedDeliverable.dependency_deliverable_id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", deliverable.id)
        .select()
        .single();

      if (error) throw error;

      onUpdate(data);

      toast({
        title: "Deliverable saved",
        description: "Deliverable updated successfully",
      });
      //   setIsOpen(false);
    } catch (error) {
      toast({
        title: "Error saving deliverable",
        description: "Error saving deliverable",
      });
      console.error("Error updating deliverable:", error);
    }
  };

  const saveContent = async (content: string) => {
    toast({
      title: "Saving deliverable content",
      description: "Please wait...",
    });
    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from("deliverable_content")
        .upsert(
          {
            deliverable_id: deliverable.id,
            content: content,
          },
          { onConflict: "deliverable_id" }
        )
        .select();

      if (error) throw error;

      setDeliverableContent(data[0] as DeliverableContent);

      toast({
        title: "Deliverable content saved",
        description: "Deliverable content updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error saving deliverable content",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
      console.error("Error saving deliverable content:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const debouncedSave = useCallback(
    debounce((content: string) => saveContent(content), 2000),
    []
  );

  const handleContentChange = (content: string) => {
    setContentToSave(content);
    debouncedSave(content);
  };

  const handleManualSave = () => {
    saveContent(contentToSave);
  };

  const checkDependencyStatus = async () => {
    if (editedDeliverable.dependency_deliverable_id) {
      // Change this line
      const { data, error } = await supabase
        .from("deliverables")
        .select("status")
        .eq("id", editedDeliverable.dependency_deliverable_id) // And this line
        .single();

      if (error) {
        console.error("Error fetching dependency status:", error);
        setDependencyCompleted(false);
      } else {
        setDependencyCompleted(data.status === "Completed");
      }
    } else {
      setDependencyCompleted(true);
    }
  };

  // Add this useEffect to recheck dependency status when editedDeliverable change
  useEffect(() => {
    checkDependencyStatus();
  }, [editedDeliverable.dependency_deliverable_id]);

  const handleRemoveDependency = async () => {
    try {
      const { data, error } = await supabase
        .from("deliverables")
        .update({ dependency_deliverable_id: null })
        .eq("id", deliverable.id)
        .select()
        .single();

      if (error) throw error;

      setEditedDeliverable(data);
      onUpdate(data);
      setDependencyCompleted(true);
      toast({
        title: "Dependency removed",
        description: "The dependency has been removed successfully.",
      });
    } catch (error) {
      console.error("Error removing dependency:", error);
      toast({
        title: "Error",
        description: "Failed to remove the dependency. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setIsOpen(true);
            fetchDeliverableContent();
          }}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-screen max-w-full sm:max-w-full md:max-w-full lg:max-w-full xl:max-w-full"
      >
        <ScrollArea className="h-[calc(100vh-2rem)] pr-4">
          <SheetHeader>
            <SheetTitle className="text-left">Edit Deliverable</SheetTitle>
            <SheetDescription className="text-left">
              {deliverable.id}
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-6 py-4">
            <div className="md:flex md:space-x-4 space-y-4 md:space-y-0">
              {/* Deliverable Details */}
              <div className="w-full md:max-w-sm bg-secondary/30 rounded-md p-4">
                <Collapsible className="md:hidden">
                  <CollapsibleTrigger className="flex items-center justify-between w-full">
                    <h3 className="text-lg font-semibold">
                      Deliverable Details
                    </h3>
                    <ChevronDown className="h-4 w-4" />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <DeliverableDetailsContent
                      editedDeliverable={editedDeliverable}
                      setEditedDeliverable={setEditedDeliverable}
                      handleSave={handleSave}
                    />
                  </CollapsibleContent>
                </Collapsible>
                <div className="hidden md:block w-full">
                  <h3 className="text-lg font-semibold mb-2">
                    Deliverable Details
                  </h3>
                  <DeliverableDetailsContent
                    editedDeliverable={editedDeliverable}
                    setEditedDeliverable={setEditedDeliverable}
                    handleSave={handleSave}
                  />
                </div>
              </div>

              {/* Deliverable Content */}
              <div className="md:flex w-full bg-secondary/30 rounded-md p-4">
                <Collapsible className="md:hidden">
                  <CollapsibleTrigger className="flex items-center justify-between w-full">
                    <div className="flex flex-row items-center w-full">
                      <h3 className="text-lg font-semibold">
                        Deliverable Content
                      </h3>
                      <AIAssistButton
                        deliverable={deliverable}
                        deliverableContent={deliverableContent?.content || ""}
                      />
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    {dependencyCompleted ? (
                      <DeliverableContentSection
                        isSaving={isSaving}
                        deliverableContentError={deliverableContentError}
                        deliverableContent={deliverableContent}
                        handleContentChange={handleContentChange}
                      />
                    ) : (
                      <DependencyWarning
                        deliverable={deliverable}
                        onRemoveDependency={handleRemoveDependency}
                      />
                    )}
                  </CollapsibleContent>
                </Collapsible>
                <div className="hidden md:block">
                  <div className="flex flex-row items-center w-full justify-between">
                    <h3 className="flex flex-row items-center text-lg font-semibold mb-2">
                      <p className="flex-none mr-2">Deliverable Content</p>
                      <AIAssistButton
                        deliverable={deliverable}
                        deliverableContent={deliverableContent?.content || ""}
                      />
                      <div
                        className={`flex flex-row space-x-3 items-start text-left transition-opacity duration-1000 ${
                          isSaving ? "block opacity-100" : "hidden opacity-0"
                        }`}
                      >
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
                        <span>Saving...</span>
                      </div>
                    </h3>
                  </div>
                  {dependencyCompleted ? (
                    <DeliverableContentSection
                      isSaving={isSaving}
                      deliverableContentError={deliverableContentError}
                      deliverableContent={deliverableContent}
                      handleContentChange={handleContentChange}
                    />
                  ) : (
                    <DependencyWarning
                      deliverable={deliverable}
                      onRemoveDependency={handleRemoveDependency}
                    />
                  )}
                  <div className="flex flex-row items-center mt-10">
                    <p className="text-muted-foreground text-xsxt-xs">
                      Accumulated AI Cost: $
                      {deliverableContent?.api_cost_chat.toFixed(4)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function DeliverableDetailsContent({
  editedDeliverable,
  setEditedDeliverable,
  handleSave,
}: {
  editedDeliverable: Deliverable;
  setEditedDeliverable: (editedDeliverable: Deliverable) => void;
  handleSave: () => void;
}) {
  const [otherDeliverables, setOtherDeliverables] = useState<Deliverable[]>([]);

  useEffect(() => {
    const fetchOtherDeliverables = async () => {
      const { data, error } = await supabase
        .from("deliverables")
        .select("*")
        .eq("task_id", editedDeliverable.task_id)
        .neq("id", editedDeliverable.id);

      if (error) {
        console.error("Error fetching other deliverables:", error);
      } else {
        setOtherDeliverables(data);
      }
    };

    isDependencyIncomplete();

    fetchOtherDeliverables();
  }, [editedDeliverable.task_id, editedDeliverable.id]);

  const isDependencyIncomplete = (): boolean => {
    // If there is no dependency deliverable ID, it's considered complete (no yellow outline)
    if (!editedDeliverable.dependency_deliverable_id) {
      return false;
    }

    // Find the dependency deliverable from the list of other deliverables
    const dependencyDeliverable = otherDeliverables.find(
      (del) => del.id === editedDeliverable.dependency_deliverable_id
    );

    // Check if the dependency deliverable is either not found or not completed
    return (
      !dependencyDeliverable || dependencyDeliverable.status !== "Completed"
    );
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="dependencyDeliverableId">Deliverable Dependency</Label>
        <Select
          value={editedDeliverable.dependency_deliverable_id || "none"}
          onValueChange={(value) =>
            setEditedDeliverable({
              ...editedDeliverable,
              dependency_deliverable_id: value !== "none" ? value : null,
            })
          }
        >
          <SelectTrigger
            className={cn(
              isDependencyIncomplete() && "border-yellow-500 border-2"
            )}
          >
            <SelectValue placeholder="Select a dependency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Dependency</SelectItem>
            {otherDeliverables.map((del) => (
              <SelectItem
                key={del.id}
                value={del.id}
                className="flex flex-row w-full items-center justify-between"
              >
                <span className="mr-4">{del.title}</span>
                <Badge variant="default">{del.status}</Badge>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-4 pb-4">
        <Label htmlFor="status" className="text-start">
          Status
        </Label>
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between text-xs">
            <Button
              variant={
                editedDeliverable.status === "Not Started" ? "default" : "ghost"
              }
              onClick={() =>
                setEditedDeliverable({
                  ...editedDeliverable,
                  status: "Not Started",
                })
              }
              className="m-0 py-0 px-4 h-fit"
            >
              Not Started
            </Button>
            <Button
              variant={
                editedDeliverable.status === "In Progress" ? "default" : "ghost"
              }
              onClick={() =>
                setEditedDeliverable({
                  ...editedDeliverable,
                  status: "In Progress",
                })
              }
              className="m-0 py-0 px-4 h-fit"
            >
              In Progress
            </Button>
            <Button
              variant={
                editedDeliverable.status === "Completed" ? "default" : "ghost"
              }
              onClick={() =>
                setEditedDeliverable({
                  ...editedDeliverable,
                  status: "Completed",
                })
              }
              className="m-0 py-0 px-4 h-fit"
            >
              Completed
            </Button>
          </div>
          <Progress
            value={
              editedDeliverable.status === "Not Started"
                ? 10
                : editedDeliverable.status === "In Progress"
                ? 50
                : 100
            }
            className="w-full h-2"
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={editedDeliverable.title}
          onChange={(e) =>
            setEditedDeliverable({
              ...editedDeliverable,
              title: e.target.value,
            })
          }
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={editedDeliverable.description}
          onChange={(e) =>
            setEditedDeliverable({
              ...editedDeliverable,
              description: e.target.value,
            })
          }
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="dueDate">Due Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !editedDeliverable.due_date && "text-muted-foreground"
              )}
            >
              {editedDeliverable.due_date ? (
                format(new Date(editedDeliverable.due_date), "PPP")
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={
                editedDeliverable.due_date
                  ? new Date(editedDeliverable.due_date)
                  : undefined
              }
              onSelect={(date) =>
                setEditedDeliverable({
                  ...editedDeliverable,
                  due_date: date ? date.toISOString() : undefined,
                })
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex justify-end">
        <Button variant="secondary" onClick={handleSave}>
          Save
        </Button>
      </div>
    </div>
  );
}

function DeliverableContentSection({
  isSaving,
  deliverableContentError,
  deliverableContent,
  handleContentChange,
}: {
  isSaving: boolean;
  deliverableContentError: boolean;
  deliverableContent: DeliverableContent | null;
  handleContentChange: (content: string) => void;
}) {
  return (
    <div className="">
      {deliverableContentError ? (
        <p className="text-sm text-red-500">
          Error loading content. Please try again.
        </p>
      ) : (
        <TipTapEditor
          initialContent={
            deliverableContent?.content ||
            "<p>Start editing your content here...</p>"
          }
          onChange={handleContentChange}
        />
      )}
    </div>
  );
}

function DependencyWarning({
  deliverable,
  onRemoveDependency,
}: {
  deliverable: Deliverable;
  onRemoveDependency: () => void;
}) {
  return (
    <div className="w-full">
      <div className="mx-auto my-10 max-w-2xl bg-amber-100/50 border-l-4 border-amber-500 text-amber-700 p-4 mb-4 rounded-lg">
        <div className="flex items-center">
          <AlertTriangle className="h-6 w-6 mr-2" />
          <p className="font-bold">Dependency Not Completed</p>
        </div>
        <p className="mt-2">
          The dependency deliverable for this item has not been completed yet.
          You need to complete the previous deliverable dependency or remove the
          dependency to proceed.
        </p>
        <Button variant="outline" className="mt-4" onClick={onRemoveDependency}>
          Remove Dependency
        </Button>
      </div>
    </div>
  );
}
