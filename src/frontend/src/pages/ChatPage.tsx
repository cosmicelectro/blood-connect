import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";
import { useMessages, useSendMessage, useUsers } from "../hooks/useBackend";

export function ChatPage() {
  const { user, isLoggedIn } = useAuth();
  const { t } = useTranslation();
  const { data: users = [] } = useUsers();
  const { data: messages = [] } = useMessages(user?.id || "");
  const sendMessage = useSendMessage();

  const [activeChatUserId, setActiveChatUserId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  if (!isLoggedIn) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-4 text-center">
        <div>
          <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
          <h2 className="text-xl font-bold font-display">Please Log In</h2>
          <p className="text-muted-foreground mt-2">
            You need to be logged in to access messages.
          </p>
        </div>
      </div>
    );
  }

  const activeChatUser = users.find((u) => u.id === activeChatUserId);

  const thread = messages.filter(
    (m) =>
      (m.senderId === user?.id && m.receiverId === activeChatUserId) ||
      (m.senderId === activeChatUserId && m.receiverId === user?.id),
  );

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !activeChatUserId) return;

    await sendMessage.mutateAsync({
      senderId: user!.id,
      senderName: user!.name,
      receiverId: activeChatUserId,
      text: text.trim(),
    });

    setText("");
  };

  // Group users you have chatted with or filtered by search
  const chatPartners = users.filter((u) => u.id !== user?.id);
  const filteredPartners = chatPartners.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 h-[calc(100vh-4rem)]">
      <div className="flex h-full border border-border rounded-xl overflow-hidden bg-card shadow-sm">
        {/* Sidebar: Users List */}
        <div className="w-1/3 border-r border-border flex flex-col bg-muted/20">
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-bold font-display mb-3">Messages</h2>
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-card"
            />
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredPartners.length === 0 ? (
              <p className="text-sm text-center text-muted-foreground mt-4">
                No users found.
              </p>
            ) : (
              filteredPartners.map((u) => {
                const isActive = u.id === activeChatUserId;
                return (
                  <button
                    key={u.id}
                    onClick={() => setActiveChatUserId(u.id)}
                    className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${
                      isActive ? "bg-primary/10 text-primary" : "hover:bg-muted"
                    }`}
                  >
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-primary">
                      <UserIcon className="h-5 w-5" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-semibold text-sm truncate text-foreground">
                        {u.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {u.role}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="w-2/3 flex flex-col bg-card">
          {activeChatUser ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border flex items-center gap-3 bg-muted/10">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <UserIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold font-display">
                    {activeChatUser.name}
                  </h3>
                  <p className="text-xs text-muted-foreground uppercase">
                    {activeChatUser.role}
                  </p>
                </div>
              </div>

              {/* Messages Thread */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {thread.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-sm text-muted-foreground italic">
                    No messages yet. Send a message to start!
                  </div>
                ) : (
                  thread.map((msg) => {
                    const isMe = msg.senderId === user?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col max-w-[70%] ${
                          isMe ? "ml-auto items-end" : "mr-auto items-start"
                        }`}
                      >
                        <div
                          className={`p-3 rounded-xl text-sm ${
                            isMe
                              ? "bg-primary text-primary-foreground rounded-tr-sm"
                              : "bg-muted text-foreground rounded-tl-sm"
                          }`}
                        >
                          {msg.text}
                        </div>
                        <span className="text-[10px] text-muted-foreground mt-1 px-1 font-mono">
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-border bg-muted/10">
                <form onSubmit={handleSend} className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="flex-1 bg-card"
                  />
                  <Button type="submit" size="icon" disabled={!text.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 opacity-20 mb-4" />
              <p>Select a user to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
