"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Textarea } from "../ui/textarea";
import { CornerRightUp, CopyIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import gfm from "remark-gfm";
import raw from "rehype-raw";
import PromptSuggestions from "./prompt-suggestions";
import CopyButton from "./copy-button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import FileItem from "./file-item";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
  inputTokens?: number;
  outputTokens?: number;
  inputCost?: number;
  outputCost?: number;
}

interface CodeBlockProps {
  language: string;
  value: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative flex flex-col rounded-lg my-2 bg-primary-foreground border max-w-2xl overflow-x-auto">
      <div className="text-text-300 absolute pl-3 pt-2.5 text-xs ">
        {language}
      </div>
      <div className=" pointer-events-none sticky z-20 my-0.5 ml-0.5 flex items-center justify-end px-1.5 py-1 mix-blend-luminosity top-0">
        <div className="from-bg-300/90 to-bg-300/70 pointer-events-auto rounded-md bg-gradient-to-b p-0.5 backdrop-blur-md">
          <button
            onClick={handleCopy}
            className="flex flex-row items-center gap-1 rounded-md p-1 py-0.5 text-xs transition-opacity delay-100 hover:bg-bg-200"
          >
            <CopyIcon
              size={14}
              className="text-text-500 mr-px -translate-y-[0.5px]"
            />
            <span className="text-text-200 pr-0.5">
              {copied ? "Copied!" : "Copy"}
            </span>
          </button>
        </div>
      </div>
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{
          margin: "0",
          borderRadius: "0.5rem",
          fontSize: "0.875rem",
          lineHeight: "1.5",
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
};

export default function Chat() {
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showSignInButton, setShowSignInButton] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const totalChatCost = useMemo(() => {
    return messages.reduce((total, message) => {
      const messageCost =
        (Number(message.inputCost) || 0) + (Number(message.outputCost) || 0);
      return total + messageCost;
    }, 0);
  }, [messages]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setAttachedFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  });

  const handleRemoveFile = (fileToRemove: File) => {
    setAttachedFiles((prev) => prev.filter((file) => file !== fileToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() && attachedFiles.length === 0) return;

    setIsLoading(true);
    const userMessage: Message = { role: "user", content: inputMessage };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputMessage("");

    const formData = new FormData();
    formData.append("messages", JSON.stringify(updatedMessages));
    attachedFiles.forEach((file) => formData.append("files", file));

    try {
      const res = await fetch("/api/claude", {
        method: "POST",
        body: formData,
      });

      if (res.status === 401) {
        // Add AI-like response for unauthorized access
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            role: "assistant",
            content: "Hold on! I need you to log in first before I can help.",
          },
        ]);
        setShowSignInButton(true);
        throw new Error("Unauthorized");
      }

      if (!res.ok) {
        throw new Error("Failed to send message");
      }

      const reader = res.body?.getReader();
      if (!reader) {
        throw new Error("No reader available");
      }

      let aiResponse = "";
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "assistant", content: "" },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split("\n\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") {
              setIsLoading(false);
              break;
            }
            try {
              const parsedData = JSON.parse(data);
              if (typeof parsedData === "string") {
                aiResponse += parsedData;
                setMessages((prevMessages) => {
                  const updatedMessages = [...prevMessages];
                  updatedMessages[updatedMessages.length - 1].content +=
                    parsedData;
                  return updatedMessages;
                });
              } else if (parsedData.inputTokens && parsedData.outputTokens) {
                setMessages((prevMessages) => {
                  const updatedMessages = [...prevMessages];
                  updatedMessages[updatedMessages.length - 1].inputTokens =
                    parsedData.inputTokens;
                  updatedMessages[updatedMessages.length - 1].outputTokens =
                    parsedData.outputTokens;
                  updatedMessages[updatedMessages.length - 1].inputCost =
                    parsedData.inputCost;
                  updatedMessages[updatedMessages.length - 1].outputCost =
                    parsedData.outputCost;
                  return updatedMessages;
                });
              }
            } catch (error) {
              console.error("Error parsing data:", error);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
      if ((error as Error).message !== "Unauthorized") {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            role: "assistant",
            content: "An error occurred while sending the message.",
          },
        ]);
      }
    } finally {
      setIsLoading(false);
      setAttachedFiles([]);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] p-4 max-w-3xl mx-auto">
      {messages.length === 0 && <PromptSuggestions />}
      <div className="flex-grow overflow-y-auto mb-4 pb-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 ${
              message.role === "user" ? "text-right" : "text-left"
            }`}
          >
            <div
              className={`group inline-block rounded-lg ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground p-2"
                  : "py-4 px-4 border border-border text-secondary-foreground relative"
              }`}
            >
              {message.role === "user" ? (
                <p className="whitespace-pre-wrap">{message.content}</p>
              ) : (
                <div className="grid-col-1 grid gap-2.5 whitespace-pre-wrap">
                  <ReactMarkdown
                    remarkPlugins={[gfm as any]}
                    rehypePlugins={[raw as any]}
                    components={{
                      p: ({ node, ...props }) => (
                        <p className="whitespace-pre-wrap" {...props} />
                      ),
                      ul: ({ node, ...props }) => (
                        <ul
                          className="-mt-1 list-disc space-y-2 pl-8"
                          {...props}
                        />
                      ),
                      ol: ({ node, ...props }) => (
                        <ol
                          className="-mt-1 list-decimal space-y-2 pl-8"
                          {...props}
                        />
                      ),
                      li: ({ node, ...props }) => (
                        <li
                          className="whitespace-normal break-words"
                          {...props}
                        />
                      ),
                      code: ({
                        node,
                        //@ts-ignore
                        inline,
                        className,
                        children,
                        ...props
                      }) => {
                        const match = /language-(\w+)/.exec(className || "");
                        return !inline && match ? (
                          <CodeBlock
                            language={match[1]}
                            value={String(children).replace(/\n$/, "")}
                          />
                        ) : (
                          <code
                            className="bg-secondary-foreground text-secondary px-1 rounded-sm"
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                  {message.role === "assistant" &&
                    showSignInButton &&
                    index === messages.length - 1 && (
                      <div className="mt-2">
                        {/* need to add functionality to signin with supabase auth */}
                        <Button
                          asChild
                          className=" text-white bg-violet-600 hover:bg-violet-500 dark:bg-violet-700 dark:hover:bg-violet-800"
                        >
                          <Link href="/signin">Sign in</Link>
                        </Button>
                      </div>
                    )}
                  <div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="">
                          <div className="text-xs text-muted-foreground">
                            Message Cost: $
                            {(
                              (Number(message.inputCost) || 0) +
                              (Number(message.outputCost) || 0)
                            ).toFixed(4)}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="">
                            Input cost: $
                            {Number(message.inputCost || 0).toFixed(5)} | Output
                            cost: ${Number(message.outputCost || 0).toFixed(5)}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="hidden group-hover:block absolute -bottom-[.80rem] right-2">
                    <CopyButton text={message.content} />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="sticky bottom-0 bg-background pt-2">
        {messages.length > 0 && (
          <div className="text-right mb-1 text-xs text-muted-foreground">
            Total Chat Cost: ${totalChatCost.toFixed(4)}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
          <div
            {...getRootProps()}
            className={`relative border-2 border-dashed p-4 rounded-md text-center ${
              attachedFiles.length === 0 ? "min-h-[2rem]" : "min-h-[12rem]"
            } ${
              isDragActive
                ? "  border-blue-500  dark:border-blue-900"
                : "text-muted-foreground"
            }`}
          >
            <input {...getInputProps()} />
            {attachedFiles.length === 0 && (
              <p>
                {isDragActive ? (
                  <p className="text-muted-foreground">
                    Yum, yum... gimme some files!
                  </p>
                ) : (
                  "Drag n drop files here, or click to select"
                )}
              </p>
            )}
            <div className="absolute top-0 left-0 right-0 bottom-0 flex flex-wrap content-start gap-4 p-4 overflow-auto">
              {attachedFiles.map((file, index) => (
                <FileItem
                  key={`${file.name}-${index}`}
                  file={file}
                  onRemove={handleRemoveFile}
                />
              ))}
            </div>
            {attachedFiles.length > 0 && (
              <div className="absolute bottom-2 left-0 right-0 text-center"></div>
            )}
          </div>
          <div className="flex space-x-2">
            <Textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message here"
              disabled={isLoading}
              className="relative flex-grow pr-[3.75rem]"
            />
            <Button
              size="icon"
              variant="secondary"
              type="submit"
              disabled={isLoading}
              className="absolute right-[.5rem] bottom-[2rem]"
            >
              {isLoading ? "Sending..." : <CornerRightUp className="w-5 h-5" />}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
