"use client";

import React, { useEffect, useCallback } from "react";
import {
  BubbleMenu,
  EditorContent,
  FloatingMenu,
  useEditor,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Toggle } from "@/components/ui/toggle";
import {
  Bold,
  Italic,
  Strikethrough,
  Minus,
  Undo,
  Redo,
  Heading1,
  Heading2,
  List,
  Pilcrow,
  Heading3,
  ListOrdered,
} from "lucide-react";
import { CommandShortcut } from "@/components/ui/command";
import { cn } from "@/lib/utils";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TipTapEditorProps {
  initialContent: string;
  onChange: (content: string) => void;
  className?: string;
}

const TipTapEditor: React.FC<TipTapEditorProps> = ({
  initialContent,
  onChange,
  className,
}) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-base prose-neutral dark:prose-invert focus:outline-none max-w-none",
          "px-2 py-2",
          "sm:px-3 sm:py-3",
          "md:px-4 md:py-4",
          className
        ),
      },
    },
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== initialContent) {
      editor.commands.setContent(initialContent);
    }
  }, [editor, initialContent]);

  return (
    <>
      {editor && (
        <BubbleMenu
          className="flex border bg-background rounded-xl shadow-md p-1 items-center justify-center gap-1 w-fit"
          tippyOptions={{ duration: 100 }}
          editor={editor}
        >
          <TooltipProvider>
            <Toggle
              size="sm"
              onClick={() => editor.chain().focus().setParagraph().run()}
              pressed={editor.isActive("paragraph")}
            >
              <Pilcrow className="w-5 h-5" />
            </Toggle>
            <Toggle
              size="sm"
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
              pressed={editor.isActive("heading", { level: 1 })}
            >
              <Heading1 className="w-5 h-5" />
            </Toggle>
            <Toggle
              size="sm"
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              pressed={editor.isActive("heading", { level: 2 })}
            >
              <Heading2 className="w-5 h-5" />
            </Toggle>
            <Toggle
              size="sm"
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 3 }).run()
              }
              pressed={editor.isActive("heading", { level: 3 })}
            >
              <Heading3 className="w-5 h-5" />
            </Toggle>
            <Toggle
              size="sm"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              pressed={editor.isActive("bulletList")}
            >
              <List className="w-5 h-5" />
            </Toggle>
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  size="sm"
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  pressed={editor.isActive("bold")}
                >
                  <Bold className="w-5 h-5" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent className="flex flex-row gap-4 items-center">
                <p>Bold</p>
                <CommandShortcut>⌘B</CommandShortcut>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  size="sm"
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  pressed={editor.isActive("italic")}
                >
                  <Italic className="w-5 h-5" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent className="flex flex-row gap-4 items-center">
                <p>Italic</p>
                <CommandShortcut>⌘I</CommandShortcut>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  size="sm"
                  onClick={() => editor.chain().focus().toggleStrike().run()}
                  pressed={editor.isActive("strike")}
                >
                  <Strikethrough className="w-5 h-5" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent className="flex flex-row gap-4 items-center">
                <p>Strikethrough</p>
                <CommandShortcut>⌘S</CommandShortcut>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  size="sm"
                  onClick={() =>
                    editor.chain().focus().setHorizontalRule().run()
                  }
                  pressed={editor.isActive("horizontalRule")}
                >
                  <Minus className="w-5 h-5" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent className="flex flex-row gap-4 items-center">
                <p>Horizontal Rule</p>
                <CommandShortcut>⌘-</CommandShortcut>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  variant="outline"
                  size="sm"
                  onClick={() => editor.chain().focus().undo().run()}
                  disabled={!editor.can().chain().focus().undo().run()}
                >
                  <Undo className="w-5 h-5" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent className="flex flex-row gap-4 items-center">
                <p>Undo</p>
                <CommandShortcut>⌘Z</CommandShortcut>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  variant="outline"
                  size="sm"
                  onClick={() => editor.chain().focus().redo().run()}
                  disabled={!editor.can().chain().focus().redo().run()}
                >
                  <Redo className="w-5 h-5" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent className="flex flex-row gap-4 items-center">
                <p>Redo</p>
                <CommandShortcut>⌘Y</CommandShortcut>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </BubbleMenu>
      )}

      {editor && (
        <FloatingMenu
          className="floating-menu bg-background border border-border p-1 gap-1 rounded-xl items-center"
          tippyOptions={{ duration: 100 }}
          editor={editor}
        >
          <Toggle
            size="sm"
            onClick={() => editor.chain().focus().setParagraph().run()}
            pressed={editor.isActive("paragraph")}
          >
            <Pilcrow className="w-5 h-5" />
          </Toggle>
          <Toggle
            size="sm"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            pressed={editor.isActive("heading", { level: 1 })}
          >
            <Heading1 className="w-5 h-5" />
          </Toggle>
          <Toggle
            size="sm"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            pressed={editor.isActive("heading", { level: 2 })}
          >
            <Heading2 className="w-5 h-5" />
          </Toggle>
          <Toggle
            size="sm"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            pressed={editor.isActive("heading", { level: 3 })}
          >
            <Heading3 className="w-5 h-5" />
          </Toggle>
          <Toggle
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            pressed={editor.isActive("bulletList")}
          >
            <List className="w-5 h-5" />
          </Toggle>
          <Toggle
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            pressed={editor.isActive("orderedList")}
          >
            <ListOrdered className="w-5 h-5" />
          </Toggle>
        </FloatingMenu>
      )}

      <EditorContent editor={editor} />
    </>
  );
};

export default TipTapEditor;
