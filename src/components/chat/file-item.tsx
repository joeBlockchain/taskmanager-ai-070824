import React from "react";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "../ui/badge";

interface FileItemProps {
  file: File;
  onRemove: (file: File) => void;
}

const FileItem: React.FC<FileItemProps> = ({ file, onRemove }) => {
  const fileSize = (file.size / 1024).toFixed(2); // size in KB

  const handleRemove = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent event from bubbling up
    onRemove(file);
  };

  return (
    <div className="relative items-center text-center justify-center w-[7rem] h-[10rem]">
      <div className="absolute">
        <div className="h-32 w-28 border border-border rounded-lg" />
      </div>

      <p className="text-sm font-medium pt-[3rem]">
        {file.name.replace(/\.[^/.]+$/, "")}
      </p>

      <div className="mt-[3rem] relative z-10">
        <Badge className="text-xs">{file.type}</Badge>
        <p className="text-xs text-muted-foreground mt-2">{fileSize} KB</p>
      </div>
      <Button
        variant="secondary"
        onClick={handleRemove}
        className="absolute -top-2 -left-2 w-6 h-6 p-0 m-0 rounded-full"
      >
        <XIcon className="h-4 w-4 text-muted-foreground" />
      </Button>
    </div>
  );
};

export default FileItem;
