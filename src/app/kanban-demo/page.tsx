"use client";

import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { ChevronDown, ExternalLink } from "lucide-react";

interface Project {
  id: string;
  name: string;
}

interface Column {
  id: string;
  title: string;
  projectId: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  columnId: string;
  projectId: string;
}

interface Deliverable {
  id: string;
  title: string;
  description: string;
  taskId: string;
  completed: boolean;
}

interface DeliverableContent {
  id: string;
  content: string;
  deliverableId: string;
}

const KanbanDemo: React.FC = () => {
  const [project, setProject] = useState<Project | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [deliverableContents, setDeliverableContents] = useState<
    DeliverableContent[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFromLocalStorage();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      saveToLocalStorage();
    }
  }, [project, columns, tasks, deliverables, deliverableContents, isLoading]);

  const loadFromLocalStorage = () => {
    try {
      const storedData = localStorage.getItem("kanbanDemoData");
      if (storedData) {
        const { project, columns, tasks, deliverables, deliverableContents } =
          JSON.parse(storedData);
        setProject(project);
        setColumns(columns);
        setTasks(tasks);
        setDeliverables(deliverables);
        setDeliverableContents(deliverableContents);
      } else {
        console.log("No stored data found. Initializing demo data.");
        initializeDemoData();
      }
    } catch (error) {
      console.error("Error loading from local storage:", error);
      initializeDemoData();
    } finally {
      setIsLoading(false);
    }
  };

  const saveToLocalStorage = () => {
    try {
      const dataToSave = {
        project,
        columns,
        tasks,
        deliverables,
        deliverableContents,
      };
      localStorage.setItem("kanbanDemoData", JSON.stringify(dataToSave));
    } catch (error) {
      console.error("Error saving to local storage:", error);
    }
  };

  const initializeDemoData = () => {
    console.log("Initializing demo data");
    const newProject: Project = { id: uuidv4(), name: "Demo Project" };
    const newColumns: Column[] = [
      { id: uuidv4(), title: "To Do", projectId: newProject.id },
      { id: uuidv4(), title: "In Progress", projectId: newProject.id },
      { id: uuidv4(), title: "Done", projectId: newProject.id },
    ];

    const blogPostTask: Task = {
      id: uuidv4(),
      title: "Write a Blog Post",
      description: "Need to write a blog post this week",
      columnId: newColumns[0].id,
      projectId: newProject.id,
    };

    const blogPostDeliverables: Deliverable[] = [
      {
        id: uuidv4(),
        title: "Brainstorm Topics",
        description: "Propose 5 topics for the blog post.",
        taskId: blogPostTask.id,
        completed: false,
      },
      {
        id: uuidv4(),
        title: "Choose Topic",
        description: "Select the topic that resonates with you the most.",
        taskId: blogPostTask.id,
        completed: false,
      },
      {
        id: uuidv4(),
        title: "Research Topic",
        description: "Collect relevant data, statistics, and expert opinions.",
        taskId: blogPostTask.id,
        completed: false,
      },
      {
        id: uuidv4(),
        title: "Create an outline",
        description: "Organize your main points and supporting details.",
        taskId: blogPostTask.id,
        completed: false,
      },
      {
        id: uuidv4(),
        title: "Write the first draft",
        description:
          "Focus on getting your ideas down without worrying about perfection.",
        taskId: blogPostTask.id,
        completed: false,
      },
      {
        id: uuidv4(),
        title: "Edit and proofread",
        description: "Refine your writing and check for errors.",
        taskId: blogPostTask.id,
        completed: false,
      },
    ];

    const blogPostDeliverableContents: DeliverableContent[] =
      blogPostDeliverables.map((deliverable) => ({
        id: uuidv4(),
        content: `Initial content for ${deliverable.title}. Replace this with actual content as you work on the deliverable.`,
        deliverableId: deliverable.id,
      }));

    setProject(newProject);
    setColumns(newColumns);
    setTasks([blogPostTask]);
    setDeliverables(blogPostDeliverables);
    setDeliverableContents(blogPostDeliverableContents);
  };

  const resetDemo = () => {
    localStorage.removeItem("kanbanDemoData");
    initializeDemoData();
  };

  const addTask = (columnId: string) => {
    const newTask: Task = {
      id: uuidv4(),
      title: "New Task",
      description: "",
      columnId: columnId,
      projectId: project!.id,
    };
    setTasks([...tasks, newTask]);
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(
      tasks.map((task) => (task.id === taskId ? { ...task, ...updates } : task))
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
    setDeliverables(
      deliverables.filter((deliverable) => deliverable.taskId !== taskId)
    );
  };

  const moveTask = (taskId: string, newColumnId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, columnId: newColumnId } : task
      )
    );
  };

  const addDeliverable = (taskId: string) => {
    const newDeliverable: Deliverable = {
      id: uuidv4(),
      title: "New Deliverable",
      description: "",
      taskId: taskId,
      completed: false,
    };
    setDeliverables([...deliverables, newDeliverable]);
  };

  const updateDeliverable = (
    deliverableId: string,
    updates: Partial<Deliverable>
  ) => {
    setDeliverables(
      deliverables.map((deliverable) =>
        deliverable.id === deliverableId
          ? { ...deliverable, ...updates }
          : deliverable
      )
    );
  };

  const deleteDeliverable = (deliverableId: string) => {
    setDeliverables(
      deliverables.filter((deliverable) => deliverable.id !== deliverableId)
    );
    setDeliverableContents(
      deliverableContents.filter(
        (content) => content.deliverableId !== deliverableId
      )
    );
  };

  const updateDeliverableContent = (
    deliverableId: string,
    newContent: string
  ) => {
    const existingContentIndex = deliverableContents.findIndex(
      (content) => content.deliverableId === deliverableId
    );
    if (existingContentIndex !== -1) {
      setDeliverableContents(
        deliverableContents.map((content, index) =>
          index === existingContentIndex
            ? { ...content, content: newContent }
            : content
        )
      );
    } else {
      setDeliverableContents([
        ...deliverableContents,
        {
          id: uuidv4(),
          content: newContent,
          deliverableId: deliverableId,
        },
      ]);
    }
  };

  const toggleDeliverableCompletion = (deliverableId: string) => {
    setDeliverables(
      deliverables.map((deliverable) =>
        deliverable.id === deliverableId
          ? { ...deliverable, completed: !deliverable.completed }
          : deliverable
      )
    );
  };

  if (isLoading) {
    return <div>Loading Kanban board...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-secondary p-2 text-center mb-4">
        This is a demo project. Your changes are saved locally.
        <Button onClick={resetDemo} className="ml-2">
          Reset Demo
        </Button>
      </div>
      <h1 className="text-2xl font-bold mb-4">
        {project?.name || "Kanban Board"}
      </h1>
      {columns.length === 0 ? (
        <div>
          <p>
            No columns found. There might be an issue with data initialization.
          </p>
          <Button onClick={initializeDemoData} className="mt-2">
            Initialize Demo Data
          </Button>
        </div>
      ) : (
        <div className="flex space-x-4 overflow-x-auto">
          {columns.map((column) => (
            <Card key={column.id} className="w-80 flex-shrink-0">
              <CardHeader>
                <CardTitle>{column.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col space-y-4">
                {tasks
                  .filter((task) => task.columnId === column.id)
                  .map((task) => (
                    <Card key={task.id} className="">
                      <CardContent className="mt-6 space-y-3">
                        <Input
                          value={task.title}
                          onChange={(e) =>
                            updateTask(task.id, { title: e.target.value })
                          }
                        />
                        <Textarea
                          value={task.description}
                          onChange={(e) =>
                            updateTask(task.id, { description: e.target.value })
                          }
                        />

                        <Button
                          onClick={() => deleteTask(task.id)}
                          variant="destructive"
                          size="sm"
                        >
                          Delete
                        </Button>
                        {columns.findIndex((c) => c.id === column.id) <
                          columns.length - 1 && (
                          <Button
                            onClick={() =>
                              moveTask(
                                task.id,
                                columns[
                                  columns.findIndex((c) => c.id === column.id) +
                                    1
                                ].id
                              )
                            }
                            size="sm"
                          >
                            Move Right
                          </Button>
                        )}

                        <Collapsible>
                          <CollapsibleTrigger>
                            <div className="flex flex-row items-center space-x-4">
                              <h4 className="">Sub Tasks?</h4>
                              <ChevronDown className="w-4 h-4" />
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            {deliverables
                              .filter(
                                (deliverable) => deliverable.taskId === task.id
                              )
                              .map((deliverable) => (
                                <div
                                  key={deliverable.id}
                                  className="flex flex-row items-center space-x-2 my-2"
                                >
                                  <Checkbox
                                    checked={deliverable.completed}
                                    onCheckedChange={() =>
                                      toggleDeliverableCompletion(
                                        deliverable.id
                                      )
                                    }
                                    className="mt-0.5"
                                  />
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <div className="flex flex-row items-center flex-grow cursor-pointer">
                                        <div className="">
                                          {deliverable.title}
                                        </div>
                                        <ExternalLink className="w-4 h-4 flex-shrink-0 ml-2" />
                                      </div>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>
                                          <Input
                                            value={deliverable.title}
                                            onChange={(e) =>
                                              updateDeliverable(
                                                deliverable.id,
                                                {
                                                  title: e.target.value,
                                                }
                                              )
                                            }
                                            className=""
                                          />
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                          <Textarea
                                            value={deliverable.description}
                                            onChange={(e) =>
                                              updateDeliverable(
                                                deliverable.id,
                                                {
                                                  description: e.target.value,
                                                }
                                              )
                                            }
                                            className=""
                                          />
                                          
                                          <Textarea
                                            value={
                                              deliverableContents.find(
                                                (content) =>
                                                  content.deliverableId ===
                                                  deliverable.id
                                              )?.content || ""
                                            }
                                            onChange={(e) =>
                                              updateDeliverableContent(
                                                deliverable.id,
                                                e.target.value
                                              )
                                            }
                                            className=""
                                            placeholder="Deliverable content..."
                                          />
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>
                                          Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction>
                                          Save
                                        </AlertDialogAction>
                                        <Button
                                          onClick={() =>
                                            deleteDeliverable(deliverable.id)
                                          }
                                          variant="destructive"
                                        >
                                          Delete Deliverable
                                        </Button>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              ))}
                            <Button
                              onClick={() => addDeliverable(task.id)}
                              size="sm"
                              className="w-full "
                              variant="secondary"
                            >
                              Add Deliverable
                            </Button>
                          </CollapsibleContent>
                        </Collapsible>
                      </CardContent>
                    </Card>
                  ))}
                <Button
                  onClick={() => addTask(column.id)}
                  size="sm"
                  className="w-full"
                  variant="secondary"
                >
                  Add Task
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default KanbanDemo;
