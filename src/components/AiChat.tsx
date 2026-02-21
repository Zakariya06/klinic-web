"use client";

import React, { useEffect, useRef, useState } from "react";
import { Copy, Send, Trash2, Download, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Spinner from "./ui/Spinner";
import { GoogleGenAI } from "@google/genai";
import { boolean } from "zod";

interface Message {
  id: string | number;
  role: "user" | "assistant";
  content: string;
}

export function AiChat({
  initialMessage,
  onExit,
}: {
  initialMessage: string;
  onExit: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState(initialMessage || "");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [isCopy, setIsCopy] = useState<null | number | string>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const ai = new GoogleGenAI({
    apiKey: import.meta.env.VITE_GEMINI_API_KEY,
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText]);

  // 🩺 Doctor Structured Response
  const generateMedicalResponse = async (userMessage: string) => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `
You are a professional AI medical assistant.

Follow this structure strictly:

## 🩺 Possible Causes
- Bullet points only

## 💊 Recommended Actions
- Bullet points only

## 🚨 When To See A Doctor
- Bullet points only

## ⚠️ Disclaimer
This is not a medical diagnosis. Consult a licensed healthcare professional.

Keep the answer under 250 words.
Be calm, professional, and medically responsible.

Patient Question:
${userMessage}
`,
              },
            ],
          },
        ],
      });

      return response.text;
    } catch (error) {
      console.log("Gemini API Error:::", error);
      return "⚠️ Unable to generate medical advice at the moment.";
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setStreamingText("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const responseText = await generateMedicalResponse(input);

      if (!responseText) return;

      const assistantMessage: Message = {
        id: Date.now(),
        role: "assistant",
        content: "",
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // ✨ Streaming Effect
      let currentText = "";
      for (let i = 0; i < responseText.length; i++) {
        currentText += responseText[i];
        setStreamingText(currentText);
        await new Promise((resolve) => setTimeout(resolve, 15));
      }

      setStreamingText("");
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessage.id
            ? { ...msg, content: responseText }
            : msg,
        ),
      );
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setTimeout(() => {
      setIsCopy(null);
    }, 3000);
  };

  const handleClearChat = () => {
    if (messages.length > 0 && confirm("Clear chat history?")) {
      setMessages([]);
      setStreamingText("");
    }
  };

  const handleExportChat = () => {
    const chatText = messages
      .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
      .join("\n\n");

    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(chatText),
    );
    element.setAttribute("download", "medical-chat.txt");
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-800">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl lg:mx-auto px-4 py-4 flex lg:items-center justify-between lg:flex-row flex-col gap-2">
          <div className="flex items-center shrink-0 gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
              <span className="text-white text-lg">🩺</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">AI Medical Assistant</h1>
              <p className="text-xs text-slate-500">
                For informational purposes only
              </p>
            </div>
          </div>

          <div className="flex flew-wrap gap-2">
            {messages.length > 0 && (
              <>
                <button
                  onClick={handleExportChat}
                  className="flex items-center gap-1 px-3 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-100 cursor-pointer transition"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <button
                  onClick={handleClearChat}
                  className="flex items-center gap-1 px-3 py-2 text-sm border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-100 transition"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear
                </button>
              </>
            )}
            <button
              onClick={onExit}
              className="flex items-center gap-1 px-3 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
              Back
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-2xl rounded-2xl px-5 py-4 shadow-sm ${
                  message.role === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-white border border-slate-200 rounded-bl-none"
                }`}
              >
                {message.role === "assistant" ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h2: ({ children }) => (
                        <h2 className="text-lg font-semibold mt-3 mb-2">
                          {children}
                        </h2>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc list-inside mb-3 space-y-1">
                          {children}
                        </ul>
                      ),
                      p: ({ children }) => <p className="mb-2">{children}</p>,
                    }}
                  >
                    {streamingText && message.content === ""
                      ? streamingText
                      : message.content}
                  </ReactMarkdown>
                ) : (
                  <p>{message.content}</p>
                )}

                {message.role === "assistant" && message.content && (
                  <button
                    onClick={() => {
                      setIsCopy(message.id);
                      copyToClipboard(message.content);
                    }}
                    className="mt-3 text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    {isCopy === message.id ? "Copied" : "Copy"}
                  </button>
                )}
              </div>
            </div>
          ))}

          {isLoading && !streamingText && (
            <div className="text-slate-500 text-sm">
              AI is analyzing your symptoms...
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-slate-200 sticky bottom-0">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <form
            onSubmit={handleSendMessage}
            className="flex gap-3 rounded-xl border border-slate-300 bg-white shadow-sm focus-within:ring-2 focus-within:ring-blue-500"
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e as any);
                }
              }}
              placeholder="Describe your symptoms..."
              className="min-h-12 max-h-32 w-full resize-none p-3 outline-none"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="h-12 w-12 flex items-center justify-center bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isLoading ? (
                <Spinner className="w-5 h-5" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </form>

          <p className="text-xs text-slate-400 mt-2">
            This AI provides general health information only. Always consult a
            licensed medical professional.
          </p>
        </div>
      </div>
    </div>
  );
}
