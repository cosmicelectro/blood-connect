import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";
import { useMessages, useSendMessage } from "../hooks/useBackend";

interface ChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  receiverId: string;
  receiverName: string;
}

export function ChatDialog({
  isOpen,
  onClose,
  receiverId,
  receiverName,
}: ChatDialogProps) {
  const { user, isLoggedIn } = useAuth();
  const { data: messages } = useMessages(user?.id || "");
  const sendMessage = useSendMessage();
  const [text, setText] = useState("");

  const thread = (messages || []).filter(
    (m) =>
      (m.senderId === user?.id && m.receiverId === receiverId) ||
      (m.senderId === receiverId && m.receiverId === user?.id),
  );

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      toast.error("Please sign in or register to send messages.");
      return;
    }
    if (!text.trim()) return;

    await sendMessage.mutateAsync({
      senderId: user!.id,
      senderName: user!.name,
      receiverId,
      text: text.trim(),
    });

    setText("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md p-5 border border-border">
        <DialogHeader className="border-b border-border pb-3 flex flex-row items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <DialogTitle className="text-base font-bold font-display">
            Chat with {receiverName}
          </DialogTitle>
        </DialogHeader>

        {/* Chat Thread */}
        <div className="h-64 overflow-y-auto space-y-2 p-2 bg-muted/20 rounded-lg">
          {thread.length === 0 ? (
            <div className="text-center text-xs text-muted-foreground py-20 italic">
              Send a message to start the conversation.
            </div>
          ) : (
            thread.map((msg) => {
              const isMe = msg.senderId === user?.id;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[75%] ${
                    isMe ? "ml-auto items-end" : "mr-auto items-start"
                  }`}
                >
                  <div
                    className={`p-2.5 rounded-lg text-sm font-medium ${
                      isMe
                        ? "bg-primary text-primary-foreground"
                        : "bg-card text-foreground border border-border"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-0.5 px-1 font-mono">
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

        {/* Send Input */}
        <form onSubmit={handleSend} className="flex gap-2 pt-2">
          <Input
            placeholder="Type your message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={!isLoggedIn}
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!isLoggedIn || !text.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
