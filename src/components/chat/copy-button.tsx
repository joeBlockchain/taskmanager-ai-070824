"use client";

import React, { useState } from "react";
import { CopyIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CopyButtonProps {
  text: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="outline"
      className="p-2 h-7 rounded-md"
      onClick={handleCopy}
    >
      <CopyIcon className="w-3 h-3 mr-2" />
      <span className="text-xs">{copied ? "Copied!" : "Copy"}</span>
    </Button>
  );
};

export default CopyButton;
