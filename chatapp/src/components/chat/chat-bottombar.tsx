// chat-bottombar.tsx
import React, { useState } from "react";
import { SendHorizontal } from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

interface ChatBottombarProps {
  sendMessage: (message: string) => void;
  isMobile: boolean;
}

export default function ChatBottombar({ sendMessage, isMobile }: ChatBottombarProps) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim()) {
      sendMessage(message.trim());
      setMessage("");
    }
  };

  return (
    <div className="p-2 flex items-center gap-2">
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        className="flex-grow"
        onKeyPress={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
      />
      <Button onClick={handleSend} size="icon">
        <SendHorizontal className="h-4 w-4" />
      </Button>
    </div>
  );
}