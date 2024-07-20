import React from "react";
import ChatTopbar from "./chat-topbar";
import { ChatList } from "./chat-list";
import { useWriteContract } from 'wagmi';
import abi from "@/config/config-abi";
import { useAccount } from 'wagmi';

const CONTRACT_ADDRESS = '0x97F758Ef7A433AbCc4D2455bAC7F115e396a9273' as `0x${string}`;

interface Friend {
  pubkey: string;
  name: string;
}

interface ChatProps {
  selectedUser: Friend | null;
  isMobile: boolean;
}

export function Chat({ selectedUser, isMobile }: ChatProps) {
  const { address } = useAccount();
  const { writeContract } = useWriteContract();

// In your Chat component
const sendMessage = async (message: string) => {
  if (!address || !selectedUser) return;

  try {
    await writeContract({
      address: CONTRACT_ADDRESS,
      abi: abi,
      functionName: 'sendMessage',
      args: [selectedUser.pubkey as `0x${string}`, message],
    });
  } catch (error) {
    console.error("Error sending message:", error);
  }
};

  // Helper function to format address
  function formatAddress(address: string): `0x${string}` {
    if (address.startsWith('0x')) {
      return address as `0x${string}`;
    }
    return `0x${address}` as `0x${string}`;
  }

  if (!selectedUser) {
    return (
      <div className="flex items-center justify-center h-full">
        Select a user to start chatting
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-between w-full h-full">
      <ChatTopbar selectedUser={selectedUser} />
      <ChatList
        selectedUser={selectedUser}
        sendMessage={sendMessage}
        isMobile={isMobile}
      />
    </div>
  );
}