import React from "react";
import { Coffee, Sun, Moon, MessageSquare } from "lucide-react";
import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CopyButton from "./copy-button";

const getGreeting = () => {
  const currentHour = new Date().getHours();
  if (currentHour < 12) {
    return { text: "Good morning!", Icon: Coffee };
  } else if (currentHour < 18) {
    return { text: "Good afternoon!", Icon: Sun };
  } else {
    return { text: "Good evening!", Icon: Moon };
  }
};

const suggestions = [
  {
    title: "Kanban Board Setup",
    description:
      "Guide me through setting up a new Kanban board for my project.",
  },
  {
    title: "Task Prioritization",
    description:
      "Help me prioritize tasks on my Kanban board for the next sprint.",
  },
  {
    title: "Workflow Optimization",
    description: "Suggest ways to optimize my workflow using the Kanban board.",
  },
  {
    title: "Team Collaboration",
    description:
      "Provide tips on how to improve team collaboration using Kanban boards.",
  },
  {
    title: "Progress Tracking",
    description:
      "Show me how to effectively track progress on my Kanban board.",
  },
  {
    title: "Task Management",
    description:
      "Give me strategies for managing tasks efficiently on a Kanban board.",
  },
];

const PromptSuggestions: React.FC = () => {
  const { text, Icon } = getGreeting();

  return (
    <div className="w-full">
      <div className="flex flex-col items-center gap-2 mb-6">
        <Badge className="py-1 px-6 text-base">Guest Plan</Badge>

        <h1 className="text-2xl sm:text-3xl font-light flex items-center">
          <Icon className="h-6 w-6 sm:h-8 sm:w-8 inline-block mr-2 relative top-[0rem]" />
          <span>{text}</span>
        </h1>
      </div>

      <div className="flex items-center justify-between mt-6 mb-2">
        <div className="flex items-center">
          <MessageSquare size={16} className="mr-2" />
          <span className="font-semibold">Prompt Suggestions</span>
        </div>
      </div>

      {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {suggestions.map((chat, index) => (
          <Card key={index} className="relative group">
            <CardHeader>
              <CardTitle className="text-lg">{chat.title}</CardTitle>
              <CardDescription>{chat.description}</CardDescription>
            </CardHeader>
            <div className="absolute -bottom-[.5rem] right-[.5rem] opacity-0 group-hover:opacity-100 transition-opacity">
              <CopyButton text={chat.description} />
            </div>
          </Card>
        ))}
      </div> */}
    </div>
  );
};

export default PromptSuggestions;
