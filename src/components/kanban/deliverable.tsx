import { useState, useEffect } from "react";
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
import { Pencil } from "lucide-react";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

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
  const [isOpen, setIsOpen] = useState(false);
  const [editedDeliverable, setEditedDeliverable] =
    useState<Deliverable>(deliverable);
  const [deliverableContent, setDeliverableContent] =
    useState<DeliverableContent | null>(null);
  const [deliverableContentError, setDeliverableContentError] =
    useState<boolean>(false);

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
      //   setIsOpen(false);
    } catch (error) {
      console.error("Error updating deliverable:", error);
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
              Edit the deliverable details and content.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-6 py-4">
            <Accordion
              type="single"
              collapsible
              defaultValue="deliverable-details"
              className="w-full"
            >
              <AccordionItem value="deliverable-details">
                <AccordionTrigger>Deliverable Details</AccordionTrigger>
                <AccordionContent className="bg-secondary/30 rounded-md p-2 mb-2  max-w-2xl">
                  <div className="space-y-4">
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
                          <SelectItem value="Not Started">
                            Not Started
                          </SelectItem>
                          <SelectItem value="In Progress">
                            In Progress
                          </SelectItem>
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
                              !editedDeliverable.due_date &&
                                "text-muted-foreground"
                            )}
                          >
                            {editedDeliverable.due_date ? (
                              format(
                                new Date(editedDeliverable.due_date),
                                "PPP"
                              )
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
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="deliverable-content">
                <AccordionTrigger>Deliverable Content</AccordionTrigger>
                <AccordionContent className="bg-secondary/30 rounded-md p-2 mb-2">
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold mb-2">
                      Deliverable Content
                    </h3>
                    {deliverableContentError ? (
                      <p className="text-sm text-red-500">
                        Error loading content. Please try again.
                      </p>
                    ) : deliverableContent === null ? (
                      <p className="text-sm">
                        No content available for this deliverable.
                      </p>
                    ) : (
                      <p className="text-sm">{deliverableContent.content}</p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
