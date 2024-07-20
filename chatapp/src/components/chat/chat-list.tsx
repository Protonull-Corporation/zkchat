import React, { useEffect, useRef } from "react";
import { useAccount, useReadContract } from 'wagmi';
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage } from "../ui/avatar";
import ChatBottombar from "./chat-bottombar";
import { AnimatePresence, motion } from "framer-motion";
import abi from "@/config/config-abi";

const CONTRACT_ADDRESS = '0x97F758Ef7A433AbCc4D2455bAC7F115e396a9273' as `0x${string}`;

interface ContractMessage {
  sender: `0x${string}`;
  timestamp: bigint;
  msg: string;
}

interface Friend {
  pubkey: string;
  name: string;
}

interface ChatListProps {
  selectedUser: Friend;
  sendMessage: (message: string) => void;
  isMobile: boolean;
}

export function ChatList({ selectedUser, sendMessage, isMobile }: ChatListProps) {
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { address } = useAccount();

  const { data: messages, isError, error } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: abi,
    functionName: 'readMessage',
    args: [selectedUser.pubkey as `0x${string}`],
    account: address, // This sets the msg.sender in the contract call
  });

  useEffect(() => {
    console.log("Selected User:", selectedUser);
    console.log("Messages:", messages);
    if (isError) {
      console.error("Error fetching messages:", error);
    }
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, selectedUser, isError, error]);

  if (isError) {
    return <div>Error loading messages. Please try again.</div>;
  }

  if (!messages) {
    return <div>Loading messages...</div>;
  }

  return (
    <div className="w-full overflow-y-auto overflow-x-hidden h-full flex flex-col">
      <div
        ref={messagesContainerRef}
        className="w-full overflow-y-auto overflow-x-hidden h-full flex flex-col"
      >
        <AnimatePresence>
          {(messages as ContractMessage[]).map((message, index) => (
            <motion.div
              key={index}
              layout
              initial={{ opacity: 0, scale: 1, y: 50, x: 0 }}
              animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, scale: 1, y: 1, x: 0 }}
              transition={{
                opacity: { duration: 0.1 },
                layout: {
                  type: "spring",
                  bounce: 0.3,
                  duration: index * 0.05 + 0.2,
                },
              }}
              style={{
                originX: 0.5,
                originY: 0.5,
              }}
              className={cn(
                "flex flex-col gap-2 p-4 whitespace-pre-wrap",
                message.sender.toLowerCase() !== address?.toLowerCase() ? "items-start" : "items-end"
              )}
            >
              <div className="flex gap-3 items-center">
                {message.sender.toLowerCase() !== address?.toLowerCase() && (
                  <Avatar className="flex justify-center items-center">
                    <AvatarImage
                      src={`https://robohash.org/${message.sender}`}
                      alt={selectedUser.name}
                      width={6}
                      height={6}
                    />
                  </Avatar>
                )}
                <span className="bg-accent p-3 rounded-md max-w-xs">
                  {message.msg}
                </span>
                {message.sender.toLowerCase() === address?.toLowerCase() && (
                  <Avatar className="flex justify-center items-center">
                    <AvatarImage
                      src={`https://robohash.org/${address}`}
                      alt="You"
                      width={6}
                      height={6}
                    />
                  </Avatar>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <ChatBottombar sendMessage={sendMessage} isMobile={isMobile} />
    </div>
  );
}