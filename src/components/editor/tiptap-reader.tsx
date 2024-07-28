import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import { EditorContent, useEditor } from "@tiptap/react";
import React from "react";

interface TipTapReaderProps {
  initialContent: string;
}

export default function TipTapReader({ initialContent }: TipTapReaderProps) {
  const editor = useEditor({
    extensions: [Document, Paragraph, Text],
    content: `
      <p>
        This is a radically reduced version of Tiptap. It has support for a document, with paragraphs and text. That’s it. It’s probably too much for real minimalists though.
      </p>
      <p>
        The paragraph extension is not really required, but you need at least one node. Sure, that node can be something different.
      </p>
    `,
  });

  return <EditorContent editor={editor} />;
}
