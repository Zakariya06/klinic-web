import React, { useState, useRef, useEffect, useCallback } from "react";
import apiClient from "@/api/client";
import { ChatHeader } from "./chat/ChatHeader";
import { MessageBubble } from "./chat/MessageBubble";
import { ChatInput } from "./chat/ChatInput";
import { LoadingIndicator } from "./chat/LoadingIndicator";
import VoiceRecognitionModal from "./chat/VoiceRecognitionModal";
import { useNavigate } from "react-router-dom";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  isStreaming?: boolean;
}

const ToctorAIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  const onClose = () => {
    navigate("/dashboard");
  };

  // Initialize chat with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        content: `<medical_assessment>
       Welcome! I'm Toctor AI, your personal medical assistant. I have access to your complete medical profile, including your health history, recent appointments, prescriptions, and lab results.
      </medical_assessment>

<recommendations>
<recommendation type="immediate">
I'm here to help you with symptom analysis, health recommendations, and medical guidance based on your personal health data.
</recommendation>
</recommendations>

<next_steps>
What health concern would you like to discuss today? You can ask me about:
• Symptom analysis and preliminary assessments
• Lab test recommendations
• Medication questions
• Health trends from your medical history
• Preventive care suggestions
</next_steps>`,
        timestamp: new Date().toISOString(),
      };
      setMessages([welcomeMessage]);
    }
  }, [navigate, messages.length]);

  // Handle modal animation
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 300); // Animation duration
    return () => clearTimeout(timer);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: inputText.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await apiClient.post("/api/v1/ai/chat", {
        message: userMessage.content,
        conversationId,
      }); 

      if (response.data.success) {
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: response.data.response,
          timestamp: response.data.timestamp || new Date().toISOString(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setConversationId(response.data.conversationId);
      } else {
        throw new Error("Failed to get response from AI");
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: `<warnings>
I apologize, but I encountered an error while processing your request. Please try again or contact support if the issue persists.

Error details: ${error instanceof Error ? error.message : "Unknown error"}
</warnings>`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = () => {
    setShowVoiceModal(true);
  };

  const handleVoiceTextReceived = useCallback((text: string) => {
    console.log("Received voice text in ToctorAIChat:", text);
    setInputText(text);
  }, []);

  // Clear chat history
  const clearChat = () => {
    setMessages([]);
    setConversationId(null);
  };

  // Handle Enter key for sending message
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // if (!isAnimating) return null;

  return (
    <>
      <div>
        <div className="flex flex-col h-full">
          {/* Header */}
          <ChatHeader onClose={onClose} />

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 pt-6">
            <div className="space-y-4">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}

              {isLoading && <LoadingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="">
            <ChatInput
              inputText={inputText}
              setInputText={setInputText}
              onSendMessage={sendMessage}
              isLoading={isLoading}
              onVoiceInput={handleVoiceInput}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>
      </div>

      {/* Voice Recognition Modal */}
      {showVoiceModal && (
        <VoiceRecognitionModal
          visible={showVoiceModal}
          onClose={() => setShowVoiceModal(false)}
          onTextReceived={handleVoiceTextReceived}
        />
      )}
    </>
  );
};

export default ToctorAIChat;
