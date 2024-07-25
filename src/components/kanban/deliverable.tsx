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
import { Pencil, ChevronDown } from "lucide-react";
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
import Tiptap from "@/components/editor/tiptap";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useToast } from "@/components/ui/use-toast";
import { AIAssistButton } from "./ai-assist-button";

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

  useEffect(() => {
    setEditedDeliverable(deliverable);
  }, [deliverable]);

  useEffect(() => {
    if (isOpen) {
      fetchDeliverableContent();
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
                <div className="hidden md:block">
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
                    <DeliverableContentSection
                      isSaving={isSaving}
                      deliverableContentError={deliverableContentError}
                      deliverableContent={deliverableContent}
                      handleContentChange={handleContentChange}
                    />
                  </CollapsibleContent>
                </Collapsible>
                <div className="hidden md:block">
                  <h3 className="text-lg font-semibold mb-2">
                    Deliverable Content
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
                  <DeliverableContentSection
                    isSaving={isSaving}
                    deliverableContentError={deliverableContentError}
                    deliverableContent={deliverableContent}
                    handleContentChange={handleContentChange}
                  />
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
  return (
    <div className="space-y-4 mt-4">
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
        <Label htmlFor="status">Status</Label>
        <Select
          value={
            editedDeliverable.status as
              | "Not Started"
              | "In Progress"
              | "Completed"
              | "Approved"
              | "Rejected"
          }
          onValueChange={(value) =>
            setEditedDeliverable({
              ...editedDeliverable,
              status: value as
                | "Not Started"
                | "In Progress"
                | "Completed"
                | "Approved"
                | "Rejected",
            })
          }
        >
          <SelectTrigger id="status">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Not Started">Not Started</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
          </SelectContent>
        </Select>
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
        <Tiptap
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
