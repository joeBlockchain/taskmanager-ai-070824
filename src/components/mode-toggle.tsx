"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Switch } from "@/components/ui/switch";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  const handleToggle = (checked: boolean) => {
    setTheme(checked ? "light" : "dark");
  };

  return (
    <div className="relative flex items-center space-x-2">
      <Moon className="z-50 absolute left-3 h-[1rem] w-[1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 pointer-events-none " />
      <Switch
        id="theme-mode"
        checked={theme === "light"}
        onCheckedChange={handleToggle}
      />
      <Sun className="z-50 absolute left-6 h-[1rem] w-[1rem] rotate-0 scale-100 transition-all dark:rotate-90 dark:scale-0 pointer-events-none" />
    </div>
  );
}
