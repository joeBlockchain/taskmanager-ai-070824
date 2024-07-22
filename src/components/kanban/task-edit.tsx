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
import { ScrollArea } from "../ui/scroll-area";

const supabase = createClient();

interface TaskEditProps {
  task: TaskType;
  setTasks: React.Dispatch<React.SetStateAction<TaskType[]>>;
}

export default function TaskEdit({ task, setTasks }: TaskEditProps) {
  const [user, setUser] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [dueDate, setDueDate] = useState<Date | undefined>(
    task.due_date ? new Date(task.due_date) : undefined
  );
  const [priority, setPriority] = useState(task.priority);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [newDeliverable, setNewDeliverable] =
    useState<Partial<Deliverable> | null>(null);
  const [editingDeliverable, setEditingDeliverable] = useState<string | null>(
    null
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
  }, [task]);

  useEffect(() => {
    fetchDeliverables();
    fetchUser();
  }, [task.id]);

  async function fetchUser() {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) throw error;

      setUser(user);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  }

  const fetchDeliverables = async () => {
    try {
      const { data, error } = await supabase
        .from("deliverables")
        .select("*")
        .eq("task_id", task.id);

      if (error) throw error;
      setDeliverables(data);
    } catch (error) {
      console.error("Error fetching deliverables:", error);
    }
  };

  const handleSaveTaskEdit = async () => {
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

      console.log("updatedTask", updatedTask);

      const { data, error } = await supabase
        .from("tasks")
        .update(updatedTask)
        .eq("id", task.id);

      console.log("data", data);
      console.log("error", error);

      if (error) throw error;

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

  const handleAddDeliverable = () => {
    setNewDeliverable({
      title: "Deliverable Title",
      status: "Not Started",
      description: "Deliverable Description",
      due_date: new Date().toISOString(),
    });
  };

  const handleSaveDeliverable = async () => {
    if (!newDeliverable || !newDeliverable.title || !user) return;

    const result = await addDeliverable(
      task.id,
      user.id,
      newDeliverable.title,
      newDeliverable.status || "Not Started",
      setTasks,
      newDeliverable.description,
      newDeliverable.due_date
    );

    if (result && result.newDeliverable) {
      setNewDeliverable(null);
      setDeliverables((prev) => [...prev, result.newDeliverable]);
    }
  };

  const handleCancelDeliverable = () => {
    setNewDeliverable(null);
  };

  const handleEditDeliverable = (deliverableId: string) => {
    setEditingDeliverable(deliverableId);
  };

  const handleSaveEditedDeliverable = async (deliverable: Deliverable) => {
    try {
      const { error } = await supabase
        .from("deliverables")
        .update(deliverable)
        .eq("id", deliverable.id);

      if (error) throw error;

      setEditingDeliverable(null);
    } catch (error) {
      console.error("Error updating deliverable:", error);
    }
  };

  const handleCancelEditDeliverable = () => {
    setEditingDeliverable(null);
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
                <div className="grid items-center gap-1.5">
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
                <div className="grid items-center gap-1.5">
                  <Label htmlFor="priority" className="text-start">
                    Priority
                  </Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger id="priority">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
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
                          {deliverables.map((deliverable) => (
                            <TableRow key={deliverable.id}>
                              {editingDeliverable === deliverable.id ? (
                                <>
                                  <TableCell>
                                    <Input
                                      value={deliverable.title}
                                      onChange={(e) =>
                                        setDeliverables((prev) =>
                                          prev.map((d) =>
                                            d.id === deliverable.id
                                              ? { ...d, title: e.target.value }
                                              : d
                                          )
                                        )
                                      }
                                    />
                                  </TableCell>
                                  <TableCell className="hidden xs:table-cell">
                                    <Select
                                      value={deliverable.status}
                                      onValueChange={(
                                        value:
                                          | "Not Started"
                                          | "In Progress"
                                          | "Completed"
                                          | "Approved"
                                          | "Rejected"
                                      ) =>
                                        setDeliverables((prev) =>
                                          prev.map((d) =>
                                            d.id === deliverable.id
                                              ? { ...d, status: value }
                                              : d
                                          )
                                        )
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Status" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Not Started">
                                          Not Started
                                        </SelectItem>
                                        <SelectItem value="In Progress">
                                          In Progress
                                        </SelectItem>
                                        <SelectItem value="Completed">
                                          Completed
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </TableCell>
                                  <TableCell className="hidden xs:table-cell">
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <Button
                                          variant="outline"
                                          className="w-full justify-start text-left font-normal"
                                        >
                                          <CalendarIcon className="mr-2 h-4 w-4" />
                                          {deliverable.due_date
                                            ? format(
                                                new Date(deliverable.due_date),
                                                "PPP"
                                              )
                                            : "Pick a date"}
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0">
                                        <Calendar
                                          mode="single"
                                          selected={
                                            deliverable.due_date
                                              ? new Date(deliverable.due_date)
                                              : undefined
                                          }
                                          onSelect={(date) =>
                                            setDeliverables((prev) =>
                                              prev.map((d) =>
                                                d.id === deliverable.id
                                                  ? {
                                                      ...d,
                                                      due_date:
                                                        date?.toISOString(),
                                                    }
                                                  : d
                                              )
                                            )
                                          }
                                          initialFocus
                                        />
                                      </PopoverContent>
                                    </Popover>
                                  </TableCell>
                                  <TableCell className="hidden sm:table-cell">
                                    <Input
                                      value={deliverable.description || ""}
                                      onChange={(e) =>
                                        setDeliverables((prev) =>
                                          prev.map((d) =>
                                            d.id === deliverable.id
                                              ? {
                                                  ...d,
                                                  description: e.target.value,
                                                }
                                              : d
                                          )
                                        )
                                      }
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex space-x-2">
                                      <Button
                                        size="sm"
                                        onClick={() =>
                                          handleSaveEditedDeliverable(
                                            deliverable
                                          )
                                        }
                                      >
                                        <Check className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={handleCancelEditDeliverable}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </>
                              ) : (
                                <>
                                  <TableCell className="font-medium">
                                    {deliverable.title}
                                  </TableCell>
                                  <TableCell className="hidden xs:table-cell">
                                    {deliverable.status}
                                  </TableCell>
                                  <TableCell className="hidden xs:table-cell">
                                    {deliverable.due_date
                                      ? format(
                                          new Date(deliverable.due_date),
                                          "PPP"
                                        )
                                      : "N/A"}
                                  </TableCell>
                                  <TableCell className="hidden sm:table-cell">
                                    {deliverable.description || "N/A"}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex space-x-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                          handleEditDeliverable(deliverable.id)
                                        }
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                          handleDeleteDeliverable(
                                            deliverable.id
                                          )
                                        }
                                      >
                                        <Trash className="h-4 w-4" />
                                      </Button>
                                      <Popover>
                                        <PopoverTrigger asChild>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                              fetchDeliverableContent(
                                                deliverable.id
                                              )
                                            }
                                          >
                                            <Paperclip className="h-4 w-4" />
                                          </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-80">
                                          <div className="space-y-2">
                                            <h4 className="font-medium">
                                              Deliverable Content
                                            </h4>
                                            {deliverableContentError[
                                              deliverable.id
                                            ] ? (
                                              <p className="text-sm text-red-500">
                                                Error loading content. Please
                                                try again.
                                              </p>
                                            ) : deliverableContent[
                                                deliverable.id
                                              ] === null ? (
                                              <p className="text-sm">
                                                No content available for this
                                                deliverable.
                                              </p>
                                            ) : (
                                              <p className="text-sm">
                                                {
                                                  deliverableContent[
                                                    deliverable.id
                                                  ]?.content
                                                }
                                              </p>
                                            )}
                                          </div>
                                        </PopoverContent>
                                      </Popover>
                                    </div>
                                  </TableCell>
                                </>
                              )}
                            </TableRow>
                          ))}
                          {newDeliverable && (
                            <TableRow>
                              <TableCell>
                                <Input
                                  placeholder="Title"
                                  value={newDeliverable.title}
                                  onChange={(e) =>
                                    setNewDeliverable({
                                      ...newDeliverable,
                                      title: e.target.value,
                                    })
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={newDeliverable.status}
                                  onValueChange={(
                                    value:
                                      | "Not Started"
                                      | "In Progress"
                                      | "Completed"
                                      | "Approved"
                                      | "Rejected"
                                  ) =>
                                    setNewDeliverable({
                                      ...newDeliverable,
                                      status: value,
                                    })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Not Started">
                                      Not Started
                                    </SelectItem>
                                    <SelectItem value="In Progress">
                                      In Progress
                                    </SelectItem>
                                    <SelectItem value="Completed">
                                      Completed
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      className="w-full justify-start text-left font-normal"
                                    >
                                      <CalendarIcon className="mr-2 h-4 w-4" />
                                      {newDeliverable.due_date
                                        ? format(
                                            new Date(newDeliverable.due_date),
                                            "PPP"
                                          )
                                        : "Pick a date"}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0">
                                    <Calendar
                                      mode="single"
                                      selected={
                                        newDeliverable.due_date
                                          ? new Date(newDeliverable.due_date)
                                          : undefined
                                      }
                                      onSelect={(date) =>
                                        setNewDeliverable({
                                          ...newDeliverable,
                                          due_date: date?.toISOString(),
                                        })
                                      }
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                              </TableCell>
                              <TableCell>
                                <Input
                                  placeholder="Description"
                                  value={newDeliverable.description}
                                  onChange={(e) =>
                                    setNewDeliverable({
                                      ...newDeliverable,
                                      description: e.target.value,
                                    })
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    onClick={handleSaveDeliverable}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleCancelDeliverable}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                      {/* <ScrollBar orientation="horizontal" /> */}
                    </div>
                    {!newDeliverable && (
                      <div className="flex justify-start p-2">
                        <Button
                          onClick={handleAddDeliverable}
                          variant="secondary"
                        >
                          <Plus className="h-4 w-4 mr-2" /> Add Deliverable
                        </Button>
                      </div>
                    )}
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
