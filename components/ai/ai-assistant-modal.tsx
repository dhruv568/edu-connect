"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Send,
  RotateCcw,
  PlusCircle,
  Sparkles,
  Bot,
  User,
  AlertCircle,
  Copy,
  Check,
  Minimize2,
} from "lucide-react";
import { THEMES, QUICK_QUESTIONS, AssistantRole } from "@/lib/ai/assistant-config";
import { MarkdownRenderer } from "./markdown-renderer";

export interface MessageItem {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  isError?: boolean;
}

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: AssistantRole;
  themeType: "home" | "learner" | "educator" | "admin";
}

const INITIAL_WELCOME =
  "Hi! I'm the EduConnects Assistant. I can help you find courses, educators, understand live classes, and navigate the platform. What can I help you with?";

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  role,
  themeType,
}) => {
  const theme = THEMES[themeType] || THEMES.home;
  const quickQuestions = QUICK_QUESTIONS[role] || QUICK_QUESTIONS.guest;

  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load initial welcome or restored session on mount / conversation init
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: INITIAL_WELCOME,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }
  }, [isOpen, messages.length]);

  // Auto-scroll to bottom when messages change or loading
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isLoading, isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    setErrorMessage(null);
    setInputText("");

    // Resize textarea back to single line
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    const userMessageId = `user-${Date.now()}`;
    const userMsg: MessageItem = {
      id: userMessageId,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    // Prepare history payload from existing messages to preserve multi-turn context
    const currentHistory = messages
      .filter((m) => !m.isError && m.id !== "welcome" && m.id !== "welcome-new" && m.id !== "cleared")
      .map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    const assistantTempId = `assistant-${Date.now()}`;

    try {
      // Send the user's natural question along with prior session context
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          conversationId: conversationId || undefined,
          history: currentHistory,
          stream: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            "Sorry, the EduConnects Assistant is temporarily unavailable. Please try again in a moment."
        );
      }

      // Check if response is event-stream
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("text/event-stream") && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let streamAccumulated = "";

        // Insert placeholder assistant message
        setMessages((prev) => [
          ...prev,
          {
            id: assistantTempId,
            role: "assistant",
            content: "",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);

        let doneReading = false;
        while (!doneReading) {
          const { done, value } = await reader.read();
          if (done) {
            doneReading = true;
            break;
          }
          const rawChunk = decoder.decode(value, { stream: true });
          const lines = rawChunk.split("\n");

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith("data: ")) {
              const dataPayload = trimmed.slice(6).trim();
              if (dataPayload === "[DONE]") {
                doneReading = true;
                break;
              }
              try {
                const parsed = JSON.parse(dataPayload);
                if (parsed.conversationId && !conversationId) {
                  setConversationId(parsed.conversationId);
                }
                if (parsed.chunk) {
                  streamAccumulated += parsed.chunk;
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantTempId
                        ? { ...msg, content: streamAccumulated }
                        : msg
                    )
                  );
                } else if (parsed.error) {
                  throw new Error(parsed.error);
                }
              } catch {
                // Ignore parse errors on partial frames
              }
            }
          }
        }
      } else {
        // Fallback standard JSON response
        const data = await response.json();
        if (data.success && data.data) {
          if (data.data.conversationId && !conversationId) {
            setConversationId(data.data.conversationId);
          }
          setMessages((prev) => [
            ...prev,
            {
              id: assistantTempId,
              role: "assistant",
              content: data.data.response,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            },
          ]);
        } else {
          throw new Error(
            data.error ||
              "Sorry, the EduConnects Assistant is temporarily unavailable. Please try again in a moment."
          );
        }
      }
    } catch (err: any) {
      console.error("[AIAssistantModal] Send error:", err);
      const friendlyErr =
        err?.message ||
        "Sorry, the EduConnects Assistant is temporarily unavailable. Please try again in a moment.";
      setErrorMessage(friendlyErr);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: friendlyErr,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNewConversation = () => {
    setConversationId(null);
    setErrorMessage(null);
    setMessages([
      {
        id: "welcome-new",
        role: "assistant",
        content: INITIAL_WELCOME,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  const handleClearConversation = () => {
    setMessages([
      {
        id: "cleared",
        role: "assistant",
        content: "Conversation cleared. How can I help you next?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setErrorMessage(null);
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    // Auto-adjust height
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-label="EduConnects AI Assistant"
      aria-modal="true"
      className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-50 w-full sm:w-[430px] h-[92vh] sm:h-[640px] max-h-[100vh] sm:max-h-[660px] flex flex-col bg-[#F4FAF7] sm:rounded-3xl shadow-2xl shadow-emerald-950/20 border border-[#A7F3D0]/80 sm:border-[#16805B]/30 overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-6"
    >
      {/* 1. Header with branding & section adaptation */}
      <div className={`px-4 py-3.5 select-none ${theme.headerBg} ${theme.headerText} shadow-sm`}>
        {/* Mobile drag handle bar */}
        <div className="w-10 h-1 bg-white/30 rounded-full mx-auto mb-2 sm:hidden" />

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Assistant Avatar with pulse ring */}
            <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 shadow-inner">
              <Bot className="w-5 h-5 text-white" />
              <span
                className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-emerald-900 ring-2 ring-emerald-400/40 animate-pulse"
                title="Online & Ready"
              />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-[15px] font-black tracking-tight text-white">EduConnects AI</h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-white/20 text-white backdrop-blur-xs border border-white/20">
                  {role === "guest" ? "Guide" : role.toLowerCase()}
                </span>
              </div>
              <p className="text-[11px] text-white/80 font-medium flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 inline-block" />
                <span>Always online & ready to assist</span>
              </p>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex items-center space-x-1 text-white/85">
            <button
              onClick={handleNewConversation}
              title="New Conversation"
              className="p-2 rounded-xl hover:bg-white/15 transition-all focus:outline-none focus:ring-1 focus:ring-white active:scale-95"
              aria-label="Start new conversation"
            >
              <PlusCircle className="w-4 h-4" />
            </button>
            <button
              onClick={handleClearConversation}
              title="Clear Chat"
              className="p-2 rounded-xl hover:bg-white/15 transition-all focus:outline-none focus:ring-1 focus:ring-white active:scale-95"
              aria-label="Clear chat history"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              title="Close Assistant"
              className="p-2 rounded-xl hover:bg-white/20 transition-all focus:outline-none focus:ring-1 focus:ring-white active:scale-95 ml-0.5"
              aria-label="Close Assistant"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Messages List Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-[#F2FAF7] via-[#EAF6F0] to-[#E2F2EA]">
        {/* Welcome Starter Card & Suggested Questions when starting */}
        {messages.length <= 1 && (
          <div className="p-4 rounded-3xl bg-white border border-[#A7F3D0]/70 shadow-xs mb-3 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">How can I help you today?</h3>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Ask any question about courses, teachers, and live classes, or pick a suggested topic below:
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  disabled={isLoading}
                  className={`text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all duration-200 text-left ${theme.pillBg} ${theme.pillBorder} ${theme.pillText} active:scale-95 shadow-2xs hover:shadow-xs hover:border-teal-400/80`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message items */}
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? `${theme.accentBg} text-white shadow-xs`
                    : "bg-white text-teal-700 border border-teal-200/80 shadow-xs"
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-teal-700" />}
              </div>

              {/* Message Bubble */}
              <div className="max-w-[84%] relative group">
                <div
                  className={`p-4 rounded-2xl text-[13.5px] leading-relaxed ${
                    isUser
                      ? `${theme.bubbleUserBg} ${theme.bubbleUserText} rounded-tr-xs shadow-xs font-normal`
                      : msg.isError
                      ? "bg-rose-50 border border-rose-200 text-rose-800 rounded-tl-xs shadow-xs"
                      : "bg-white border border-slate-200/90 text-slate-800 rounded-tl-xs shadow-xs"
                  }`}
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  ) : (
                    <MarkdownRenderer content={msg.content} />
                  )}
                </div>

                {/* Metadata & Copy action */}
                <div
                  className={`flex items-center gap-1.5 mt-1.5 px-1 text-[11px] text-slate-500 ${
                    isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.timestamp && <span>{msg.timestamp}</span>}
                  {!isUser && !msg.isError && msg.content && (
                    <button
                      onClick={() => handleCopyMessage(msg.id, msg.content)}
                      className="opacity-0 group-hover:opacity-100 hover:text-slate-800 transition-opacity ml-1.5 flex items-center gap-1 font-medium bg-white hover:bg-emerald-50 border border-[#A7F3D0]/60 px-1.5 py-0.5 rounded text-[10px] text-slate-600 shadow-2xs"
                      title="Copy response"
                    >
                      {copiedMessageId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading / Typing indicator */}
        {isLoading && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-white text-teal-700 border border-teal-200/80 flex items-center justify-center shrink-0 shadow-xs">
              <Bot className="w-4 h-4 text-teal-600 animate-pulse" />
            </div>
            <div className="bg-white border border-[#A7F3D0]/60 px-4 py-3 rounded-2xl rounded-tl-xs shadow-xs flex items-center gap-2.5">
              <span className="text-xs text-slate-600 font-medium">EduConnects AI is thinking</span>
              <div className="flex items-center space-x-1">
                <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce" />
              </div>
            </div>
          </div>
        )}

        {/* Error state with retry */}
        {errorMessage && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>An error occurred. Please try again.</span>
            </div>
            <button
              onClick={() => {
                const lastUser = [...messages].reverse().find((m) => m.role === "user");
                if (lastUser) handleSendMessage(lastUser.content);
              }}
              className="font-bold underline hover:text-rose-900 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Input command bar */}
      <div className="p-3.5 bg-white border-t border-[#A7F3D0]/60 shadow-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-end gap-2"
        >
          <div className="relative flex-1 rounded-2xl border border-slate-200 focus-within:border-teal-600 focus-within:ring-4 focus-within:ring-teal-500/15 bg-slate-50/80 focus-within:bg-white transition-all">
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={handleTextareaInput}
              onKeyDown={handleKeyDown}
              rows={1}
              maxLength={1000}
              placeholder="Ask anything about courses, teachers, live classes..."
              className="w-full resize-none bg-transparent px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none max-h-32 font-normal leading-relaxed"
            />
          </div>

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            aria-label="Send message"
            className={`flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-200 shrink-0 shadow-xs ${
              inputText.trim() && !isLoading
                ? `${theme.accentBg} ${theme.accentHover} text-white shadow-md active:scale-95`
                : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200/60"
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            Press <kbd className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[10px] text-slate-600 border border-slate-200">Enter ↵</kbd> to send
          </span>
          <span>
            {inputText.length > 0 ? `${inputText.length}/1000` : "EduConnects AI"}
          </span>
        </div>
      </div>
    </div>
  );
};
