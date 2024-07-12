// src/components/kanban/defaultData.ts
import type { Column } from "./types";
import type { Task } from "./types";

export const defaultCols: Column[] = [
  {
    id: "todo" as const,
    title: "Todo",
  },
  {
    id: "in-progress" as const,
    title: "In progress",
  },
  {
    id: "done" as const,
    title: "Done",
  },
];

export const initialTasks: Task[] = [
  // {
  //   id: "task1",
  //   columnId: "done",
  //   title: "Project   ",
  //   content: "Project initiation and planning",
  // },
  // {
  //   id: "task2",
  //   columnId: "done",
  //   title: "Gather requirements  ",
  //   content: "Gather requirements from stakeholders",
  // },
  // {
  //   id: "task3",
  //   columnId: "done",
  //   title: "Create wireframes",
  //   content: "Create wireframes and mockups",
  // },
  // {
  //   id: "task4",
  //   columnId: "in-progress",
  //   title: "Develop homepage ",
  //   content: "Develop homepage layout",
  // },
  // {
  //   id: "task5",
  //   columnId: "in-progress",
  //   title: "Design  ",
  //   content: "Design color scheme and typography",
  // },
  // {
  //   id: "task6",
  //   columnId: "todo",
  //   title: "Implement  authentication",
  //   content: "Implement user authentication",
  // },
  // {
  //   id: "task7",
  //   columnId: "todo",
  //   title: "Build contact us ",
  //   content: "Build contact us page",
  // },
  // {
  //   id: "task8",
  //   columnId: "todo",
  //   title: "Create  catalog",
  //   content: "Create product catalog",
  // },
  // {
  //   id: "task9",
  //   columnId: "todo",
  //   title: "Develop about us ",
  //   content: "Develop about us page",
  // },
  // {
  //   id: "task10",
  //   columnId: "todo",
  //   title: "Optimize for mobile ",
  //   content: "Optimize website for mobile devices",
  // },
  // {
  //   id: "task11",
  //   columnId: "todo",
  //   title: "Integrate payment ",
  //   content: "Integrate payment gateway",
  // },
  // {
  //   id: "task12",
  //   columnId: "todo",
  //   title: "Perform testing ",
  //   content: "Perform testing and bug fixing",
  // },
  // {
  //   id: "task13",
  //   columnId: "todo",
  //   title: "Launch website",
  //   content: "Launch website and deploy to server",
  // },
];
