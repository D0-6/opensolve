"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, Check, MessageCircle, X, Send, Loader2 } from "lucide-react";

interface Notification {
  userId: string;
  createdAt: string;
  notificationId: string;
  type: string;
  title: string;
  message: string;
  problemId?: string;
  threadId?: string;
  read: boolean;
}

interface Message {
  threadId: string;
  createdAt: string;
  messageId: string;
  senderId: string;
  senderName: string;
  text: string;
}

export function NotificationsPanel({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markRead = async (n: Notification) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ createdAt: n.createdAt }),
      });
      setNotifications(prev => prev.map(notif =>
        notif.createdAt === n.createdAt ? { ...notif, read: true } : notif
      ));
    } catch (err) {
      console.error(err);
    }
  };

  const typeColor = (type: string) => {
    if (type === "HIRE") return "bg-green-100 text-green-700 border-green-200";
    if (type === "CONTRACT") return "bg-blue-100 text-blue-700 border-blue-200";
    if (type === "INTERVIEW") return "bg-yellow-50 text-yellow-700 border-yellow-200";
    if (type === "MESSAGE") return "bg-zinc-100 text-zinc-600 border-zinc-200";
    return "bg-zinc-100 text-zinc-600 border-zinc-200";
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center gap-2 px-4 py-2 border border-zinc-200 bg-white hover:bg-zinc-50 transition-colors text-sm font-medium text-zinc-700"
      >
        <Bell size={16} />
        Notifications
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#1a3a5c] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white border border-zinc-200 shadow-xl z-50 max-h-[80vh] flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 bg-zinc-50">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-700">Notifications</span>
            <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-zinc-900">
              <X size={16} />
            </button>
          </div>
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-zinc-400 text-sm">No notifications yet</div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.createdAt}
                  className={`px-4 py-4 border-b border-zinc-100 cursor-pointer hover:bg-zinc-50 transition-colors ${!n.read ? "bg-blue-50/40" : ""}`}
                  onClick={() => markRead(n)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border shrink-0 mt-0.5 ${typeColor(n.type)}`}>
                      {n.type.replace(/_/g, " ")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-zinc-900 leading-tight">{n.title}</div>
                      <div className="text-xs text-zinc-500 mt-1 leading-relaxed">{n.message}</div>
                      <div className="text-[10px] text-zinc-400 mt-2 font-bold uppercase tracking-wider">
                        {new Date(n.createdAt.split("#")[0]).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                      </div>
                    </div>
                    {!n.read && (
                      <div className="w-2 h-2 bg-[#1a3a5c] rounded-full shrink-0 mt-1" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Message thread component — embedded in dashboard
export function MessageThread({
  threadId,
  myUserId,
  myName,
  recipientUserId,
  recipientName,
}: {
  threadId: string;
  myUserId: string;
  myName: string;
  recipientUserId: string;
  recipientName: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/messages?threadId=${encodeURIComponent(threadId)}`);
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error(err);
    }
  }, [threadId]);

  useEffect(() => {
    if (isOpen) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 10000);
      return () => clearInterval(interval);
    }
  }, [isOpen, fetchMessages]);

  const handleSend = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId,
          text,
          senderName: myName,
          recipientUserId,
        }),
      });
      setText("");
      await fetchMessages();
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-[#1a3a5c] uppercase tracking-wider transition-colors"
      >
        <MessageCircle size={14} /> Message Org
      </button>

      {isOpen && (
        <div className="fixed inset-x-4 bottom-4 md:inset-x-auto md:right-8 md:bottom-8 md:w-96 bg-white border border-zinc-200 shadow-2xl z-50 flex flex-col" style={{ height: "420px" }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#1a3a5c] text-white">
            <div>
              <div className="text-sm font-semibold">{recipientName}</div>
              <div className="text-[10px] text-blue-200 uppercase tracking-wider">Organization</div>
            </div>
            <button onClick={() => setIsOpen(false)}><X size={18} className="text-blue-200 hover:text-white" /></button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-50">
            {messages.length === 0 ? (
              <div className="text-center text-xs text-zinc-400 pt-8">No messages yet. Say hello!</div>
            ) : (
              messages.map(msg => (
                <div key={msg.createdAt} className={`flex ${msg.senderId === myUserId ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] px-3 py-2 text-sm rounded ${
                    msg.senderId === myUserId
                      ? "bg-[#1a3a5c] text-white"
                      : "bg-white border border-zinc-200 text-zinc-900"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 p-3 border-t border-zinc-200 bg-white">
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Type a message..."
              className="flex-1 text-sm border border-zinc-200 px-3 py-2 focus:outline-none focus:border-[#1a3a5c] transition-colors"
            />
            <button
              onClick={handleSend}
              disabled={sending || !text.trim()}
              className="p-2 bg-[#1a3a5c] text-white hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Application status badge display helper
export function EvalStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    "PENDING": { label: "Under Review", className: "bg-zinc-100 text-zinc-600 border-zinc-200" },
    "HIRED": { label: "🎉 Hired", className: "bg-green-100 text-green-700 border-green-200" },
    "CONTRACT_OFFERED": { label: "📄 Contract Offered", className: "bg-blue-100 text-blue-700 border-blue-200" },
    "INTERVIEW_REQUESTED": { label: "📅 Interview", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
    "REJECTED": { label: "Not Selected", className: "bg-red-50 text-red-600 border-red-200" },
  };
  const cfg = map[status] || map["PENDING"];
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 border ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}
