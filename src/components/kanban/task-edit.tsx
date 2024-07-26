"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Task as TaskType,
  Deliverable,
  DeliverableContent,
  Deliverable as DeliverableType,
} from "@/components/kanban/types";
import {
  PencilLine,
  Calendar as CalendarIcon,
  Check,
  Plus,
  X,
  Trash,
  Pencil,
  Paperclip,
  FilePenLine,
  ExternalLink,
  Pen,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { addDeliverable } from "@/components/kanban/actions";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DeliverableContentSheet } from "@/components/kanban/deliverable";
import { useToast } from "@/components/ui/use-toast";

const supabase = createClient();

interface TaskEditProps {
  task: TaskType;
  setTasks: React.Dispatch<React.SetStateAction<TaskType[]>>;
  deliverables: DeliverableType[];
  setDeliverables: React.Dispatch<React.SetStateAction<DeliverableType[]>>;
}

export default function TaskEdit({
  task,
  setTasks,
  deliverables,
  setDeliverables,
}: TaskEditProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [dueDate, setDueDate] = useState<Date | undefined>(
    task.due_date ? new Date(task.due_date) : undefined
  );
  const [priority, setPriority] = useState(task.priority);

  const [taskDeliverables, setTaskDeliverables] = useState<DeliverableType[]>(
    []
  );

  const [deliverableContent, setDeliverableContent] = useState<
    Record<string, DeliverableContent | null>
  >({});
  const [deliverableContentError, setDeliverableContentError] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description);
    setDueDate(task.due_date ? new Date(task.due_date) : undefined);
    setPriority(task.priority);

    if (Array.isArray(deliverables)) {
      setTaskDeliverables(deliverables.filter((d) => d.task_id === task.id));
    } else {
      setTaskDeliverables([]);
    }
  }, [task, deliverables]);

  const handleSaveTaskEdit = async () => {
    toast({
      title: "Saving task",
      description: "Please wait...",
    });
    try {
      const { deliverables, ...taskWithoutDeliverables } = task;
      const updatedTask = {
        ...taskWithoutDeliverables,
        title,
        description,
        due_date: dueDate ? dueDate.toISOString() : null,
        priority,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("tasks")
        .update(updatedTask)
        .eq("id", task.id);

      if (error) throw error;

      toast({
        title: "Task saved",
        description: "Task updated successfully",
      });

      setIsOpen(false);
    } catch (error) {
      console.error("Error updating task:", error);
      // Handle error (e.g., show an error message to the user)
    }
  };

  const handleCancelTaskEdit = () => {
    setTitle(task.title);
    setDescription(task.description);
    setDueDate(task.due_date ? new Date(task.due_date) : undefined);
    setPriority(task.priority);
    setIsOpen(false);
  };

  const handleDeleteDeliverable = async (deliverableId: string) => {
    try {
      const { error } = await supabase
        .from("deliverables")
        .delete()
        .eq("id", deliverableId);

      if (error) throw error;

      setDeliverables((prevDeliverables) =>
        prevDeliverables.filter(
          (deliverable) => deliverable.id !== deliverableId
        )
      );
    } catch (error) {
      console.error("Error deleting deliverable:", error);
    }
  };

  const fetchDeliverableContent = async (deliverableId: string) => {
    try {
      const { data, error } = await supabase
        .from("deliverable_content")
        .select("*")
        .eq("deliverable_id", deliverableId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No content found
          setDeliverableContent((prev) => ({ ...prev, [deliverableId]: null }));
        } else {
          throw error;
        }
      } else {
        setDeliverableContent((prev) => ({ ...prev, [deliverableId]: data }));
      }
    } catch (error) {
      console.error("Error fetching deliverable content:", error);
      setDeliverableContentError((prev) => ({
        ...prev,
        [deliverableId]: true,
      }));
    }
  };

  const handleAddDeliverable = async () => {
    try {
      const { data, error } = await supabase.from("deliverables").insert({
        task_id: task.id,
        title: "New Deliverable",
        description: "Deliverable Description",
        status: "Not Started",
        due_date: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error adding deliverable:", error);
      // Handle error (e.g., show an error message to the user)
    }
  };

  const handleUpdateDeliverable = (updatedDeliverable: DeliverableType) => {
    setDeliverables((prevDeliverables) =>
      prevDeliverables.map((d) =>
        d.id === updatedDeliverable.id ? updatedDeliverable : d
      )
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-[2rem] h-[2rem] p-0 m-0">
          <PencilLine className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      {/* CONTAINTER THAT THE CARD WITH THE DIV CANNOT BE BIGGER THAN THE DIALOGCONTENT */}
      <DialogContent className="max-w-lg sm:max-w-2xl md:max-w-3xl max-h-[90vh] m-0 py-4 px-2">
        <ScrollArea className="h-[70vh]">
          <DialogHeader className="px-4 py-2">
            <DialogDescription className="">
              <div className="space-y-4 px-[.2rem]">
                <div className="grid items-center gap-1.5">
                  <Label htmlFor="title" className="text-start">
                    Title
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="grid items-center gap-1.5">
                  <Label htmlFor="description" className="text-start">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="flex flex-row gap-4">
                  <div className="grid items-center gap-1.5 w-1/2">
                    <Label htmlFor="dueDate" className="text-start">
                      Due Date
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !dueDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dueDate ? (
                            format(dueDate, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dueDate}
                          onSelect={setDueDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="grid items-center gap-1.5 w-1/2">
                    <Label htmlFor="priority" className="text-start">
                      Priority
                    </Label>
                    <div className="flex flex-col space-y-2">
                      <div className="flex justify-between text-xs">
                        <span
                          className="cursor-pointer"
                          onClick={() => setPriority("low")}
                        >
                          Low
                        </span>
                        <span
                          className="cursor-pointer"
                          onClick={() => setPriority("medium")}
                        >
                          Medium
                        </span>
                        <span
                          className="cursor-pointer"
                          onClick={() => setPriority("high")}
                        >
                          High
                        </span>
                        <span
                          className="cursor-pointer"
                          onClick={() => setPriority("urgent")}
                        >
                          Urgent
                        </span>
                      </div>
                      <div className="relative">
                        <div
                          className="w-full h-2 bg-gray-200 rounded-full cursor-pointer"
                          onClick={(e) => {
                            const rect =
                              e.currentTarget.getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            const percentage = x / rect.width;
                            if (percentage <= 0.25) setPriority("low");
                            else if (percentage <= 0.5) setPriority("medium");
                            else if (percentage <= 0.75) setPriority("high");
                            else setPriority("urgent");
                          }}
                        >
                          <div
                            className={`h-full rounded-full ${
                              priority === "low"
                                ? "w-1/4 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-100"
                                : priority === "medium"
                                ? "w-1/2 bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100"
                                : priority === "high"
                                ? "w-3/4 bg-blue-100 text-blue-700 dark:bg-blue-700 dark:text-blue-100"
                                : priority === "urgent"
                                ? "w-full bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100"
                                : "w-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-100"
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid items-center gap-1.5">
                  <Label className="text-start">Deliverables</Label>
                  {/* CARD MUST CONSTRAIN TABLE CONTENT AND CANNOT GROW BIGGER THAN DIALOGCONTENT */}
                  <Card className="">
                    <div className="overflow-x-auto">
                      <Table className="w-full">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="">Title</TableHead>
                            <TableHead className="hidden xs:table-cell">
                              Status
                            </TableHead>
                            <TableHead className="hidden xs:table-cell">
                              Due Date
                            </TableHead>
                            <TableHead className="hidden sm:table-cell">
                              Description
                            </TableHead>

                            <TableHead className="w-[150px]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {taskDeliverables?.map((deliverable) => (
                            <TableRow key={deliverable.id}>
                              <TableCell className="font-medium text-left">
                                {deliverable.title}
                              </TableCell>
                              <TableCell className="hidden xs:table-cell text-left">
                                {deliverable.status}
                              </TableCell>
                              <TableCell className="hidden xs:table-cell text-left">
                                {deliverable.due_date
                                  ? format(
                                      new Date(deliverable.due_date),
                                      "PPP"
                                    )
                                  : "N/A"}
                              </TableCell>
                              <TableCell className="hidden sm:table-cell text-left">
                                {deliverable.description || "N/A"}
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleDeleteDeliverable(deliverable.id)
                                    }
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                  <DeliverableContentSheet
                                    task={task}
                                    deliverable={deliverable}
                                    onUpdate={handleUpdateDeliverable}
                                  />
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="flex justify-start p-2">
                      <Button
                        onClick={handleAddDeliverable}
                        variant="secondary"
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Deliverable
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
        </ScrollArea>
        <DialogFooter className="px-2">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="outline" onClick={handleCancelTaskEdit}>
              Cancel
            </Button>
            <Button onClick={handleSaveTaskEdit} variant="secondary">
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
