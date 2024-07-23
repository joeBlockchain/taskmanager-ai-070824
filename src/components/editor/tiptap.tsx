import React, { useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

interface TiptapProps {
  initialContent: string;
  onChange: (content: string) => void;
}

const Tiptap: React.FC<TiptapProps> = ({ initialContent, onChange }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-base prose-neutral dark:prose-invert focus:outline-none max-w-none",
      },
    },
  });

  return <EditorContent editor={editor} />;
};

export default Tiptap;
