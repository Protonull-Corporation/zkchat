"use client";

import { useEffect, useState } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { cn } from "@/lib/utils";
import { Sidebar } from "../sidebar";
import { Chat } from "./chat";
import { useReadContract } from 'wagmi';
import abi from "@/config/config-abi";
import { useAccount } from 'wagmi';

const CONTRACT_ADDRESS = '0x97F758Ef7A433AbCc4D2455bAC7F115e396a9273';
interface Friend {
  pubkey: string;
  name: string;
}
interface ChatLayoutProps {
  defaultLayout: number[] | undefined;
  defaultCollapsed?: boolean;
  navCollapsedSize: number;
}

export function ChatLayout({
  defaultLayout = [320, 480],
  defaultCollapsed = false,
  navCollapsedSize,
}: ChatLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [selectedUser, setSelectedUser] = useState<Friend | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const { address } = useAccount();

  const { data: friendList } = useReadContract({
    abi,
    address: CONTRACT_ADDRESS,
    functionName: 'getFriendList',
    args: address ? [address] : undefined,
  });

  useEffect(() => {
    const checkScreenWidth = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkScreenWidth();
    window.addEventListener("resize", checkScreenWidth);
    return () => {
      window.removeEventListener("resize", checkScreenWidth);
    };
  }, []);
  useEffect(() => {
    console.log("Selected user changed:", selectedUser);
  }, [selectedUser]);
  const handleSelectUser = (user: Friend) => {
    console.log(user.name);
    setSelectedUser(user);
  };

  return (
    <ResizablePanelGroup
      direction="horizontal"
      onLayout={(sizes: number[]) => {
        document.cookie = `react-resizable-panels:layout=${JSON.stringify(sizes)}`;
      }}
      className="h-full items-stretch"
    >
      <ResizablePanel
        defaultSize={defaultLayout[0]}
        collapsedSize={navCollapsedSize}
        collapsible={true}
        minSize={isMobile ? 0 : 24}
        maxSize={isMobile ? 8 : 30}
        onCollapse={() => setIsCollapsed(true)}
        onExpand={() => setIsCollapsed(false)}
        className={cn(isCollapsed && "min-w-[50px] md:min-w-[70px] transition-all duration-300 ease-in-out")}
      >
        <Sidebar
          isCollapsed={isCollapsed || isMobile}
          isMobile={isMobile}
          onSelectUser={handleSelectUser}
        />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
        {selectedUser ? (
          <Chat
            selectedUser={selectedUser}
            isMobile={isMobile}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            Select a user to start chatting
          </div>
        )}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}