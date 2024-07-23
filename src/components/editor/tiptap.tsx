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
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none",
      },
    },
  });

  return (
    <div className="tiptap-container">
      <style jsx global>{`
        .tiptap-container .ProseMirror {
          outline: none;
        }
        .tiptap-container .ProseMirror:focus {
          outline: none;
          box-shadow: none;
        }
      `}</style>
      <EditorContent editor={editor} />
    </div>
  );
};

export default Tiptap;
