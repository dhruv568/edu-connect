"use client";

import React, { useEffect, useRef, useState } from "react";
import { ClassroomMessageItem } from "@/types/classroom";
import { Badge } from "@/components/ui/badge";
import { Send, MessageSquare } from "lucide-react";

interface ChatPanelProps {
  messages: ClassroomMessageItem[];
  currentUserId: string;
  onSendMessage: (text: string) => Promise<void>;
  onClose: () => void;
}

export function ChatPanel({
  messages,
  currentUserId,
  onSendMessage,
  onClose,
}: ChatPanelProps) {
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text || isSending) return;

    try {
      setIsSending(true);
      setInputText("");
      await onSendMessage(text);
    } catch (err) {
      console.error("Failed to send chat message:", err);
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  return (
    <div className="w-full h-full bg-slate-900 border-l border-slate-800 flex flex-col overflow-hidden text-slate-100">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-blue-400" />
          <h3 className="text-sm font-bold text-white">Classroom Chat</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-white text-xs font-semibold"
        >
          Close
        </button>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length > 0 ? (
          messages.map((m) => {
            const isMe = m.senderId === currentUserId;
            const isTeacher = m.senderRole === "TEACHER";

            return (
              <div
                key={m.id}
                className={`flex flex-col gap-1 ${isMe ? "items-end" : "items-start"}`}
              >
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-300">{m.senderName}</span>
                  <Badge
                    variant={isTeacher ? "teacher" : "student"}
                    className="text-[9px] px-1 py-0"
                  >
                    {isTeacher ? "Teacher" : "Student"}
                  </Badge>
                  <span>• {formatTime(m.createdAt)}</span>
                </div>

                <div
                  className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-xs leading-relaxed break-words shadow-sm ${
                    isMe
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-slate-800 text-slate-200 border border-slate-700/60 rounded-bl-none"
                  }`}
                >
                  {m.message}
                </div>
              </div>
            );
          })
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center gap-2 text-slate-500 py-8">
            <MessageSquare className="h-8 w-8 text-slate-600" />
            <p className="text-xs font-semibold text-slate-400">No messages yet</p>
            <p className="text-[11px] text-slate-500 max-w-[200px]">
              Start the conversation by sending a question or greeting!
            </p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-800 bg-slate-950/40 flex items-center gap-2">
        <input
          type="text"
          placeholder="Type a message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          maxLength={1000}
          className="flex-1 h-10 px-3.5 text-xs bg-slate-800 border border-slate-700 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isSending}
          className="h-10 w-10 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl flex items-center justify-center transition-all shrink-0"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
