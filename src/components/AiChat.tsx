import { GoogleGenAI } from "@google/genai";
import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FaCopy } from "react-icons/fa";

interface Message {
  role: "user" | "ai";
  content: string;
}

interface Props {
  initialMessage: string;
  onExit: () => void;
}

const AiChat: React.FC<Props> = ({ initialMessage, onExit }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const ai = new GoogleGenAI({
    apiKey: import.meta.env.VITE_GEMINI_API_KEY,
  });

  const callGemini = async (text: string) => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ text }] }],
      });
      return (
        response?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No response from AI."
      );
    } catch (err) {
      console.error("Gemini call error:", err);
      return "Error connecting to AI.";
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const updated = [...messages, { role: "user" as const, content: text }];
    setMessages(updated);
    setInput("");
    setLoading(true);
    const aiReply = await callGemini(text);
    setMessages([...updated, { role: "ai" as const, content: aiReply }]);
    setLoading(false);
  };

  useEffect(() => {
    if (initialMessage.trim()) sendMessage(initialMessage);
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="p-4 bg-white shadow flex justify-between items-center">
        <h2 className="text-xl font-semibold">AI Doctor</h2>
        <button
          onClick={onExit}
          className="text-sm text-red-500 hover:underline"
        >
          Close
        </button>
      </div>

      {/* Chat messages */}
      <div className="flex-1 container mx-auto overflow-y-auto p-6 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`relative p-4 rounded-xl break-words ${
              msg.role === "user"
                ? "bg-blue-600 text-white ml-auto max-w-5xl"
                : "bg-white shadow max-w-7xl"
            }`}
          >
            {/* Copy button */}
            <button
              onClick={() => handleCopy(msg.content)}
              className={`absolute top-2 right-2 p-1 rounded hover:bg-gray-200 transition ${
                msg.role === "user"
                  ? "text-white hover:bg-blue-500"
                  : "text-gray-500"
              }`}
            >
              <FaCopy />
            </button>

            {/* Markdown rendering */}
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ node, ...props }: any) => (
                  <h1 className="my-2 text-2xl font-bold" {...props} />
                ),
                h2: ({ node, ...props }: any) => (
                  <h2 className="my-2 text-xl font-semibold" {...props} />
                ),
                h3: ({ node, ...props }: any) => (
                  <h3 className="my-2 text-lg font-semibold" {...props} />
                ),
                h4: ({ node, ...props }: any) => (
                  <h4 className="my-2 font-medium" {...props} />
                ),
                h5: ({ node, ...props }: any) => (
                  <h5 className="my-2 font-medium" {...props} />
                ),
                h6: ({ node, ...props }: any) => (
                  <h6 className="my-2 font-medium" {...props} />
                ),
                p: ({ node, ...props }: any) => <p className="my-2" {...props} />,
                hr: ({ node, ...props }: any) => (
                  <hr className="my-2 border-gray-300" {...props} />
                ),
                ul: ({ node, ...props }: any) => (
                  <ul className="my-2 list-disc list-inside" {...props} />
                ),
                ol: ({ node, ...props }: any) => (
                  <ol className="my-2 list-decimal list-inside" {...props} />
                ),
                table: ({ node, ...props }: any) => (
                  <table
                    className="my-2 border border-gray-300 w-full text-sm border-collapse"
                    {...props}
                  />
                ),
                th: ({ node, ...props }: any) => (
                  <th className="border p-2 bg-gray-200" {...props} />
                ),
                td: ({ node, ...props }: any) => (
                  <td className="border p-2" {...props} />
                ),
                blockquote: ({ node, ...props }: any) => (
                  <blockquote
                    className="my-2 border-l-4 pl-4 italic text-gray-600"
                    {...props}
                  />
                ),
                br: () => <br className="my-2" />,
              }}
            >
              {msg.content}
            </ReactMarkdown>
          </div>
        ))}
        {loading && <div className="text-gray-400">AI typing...</div>}
      </div>

      {/* Input box */}
      <div className="p-4 bg-white border-t flex gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask follow-up question..."
          className="flex-1 border rounded-xl px-4 py-2 outline-none"
        />
        <button
          onClick={() => sendMessage(input)}
          className="bg-black text-white px-6 rounded-xl"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default AiChat;
