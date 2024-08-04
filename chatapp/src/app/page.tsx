'use client'
import { useState, useEffect } from 'react';
import { ChatLayout } from "@/components/chat/chat-layout";
import { WagmiProvider, createConfig, http } from "wagmi";
import { zkSyncSepoliaTestnet } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import abi from '@/config/config-abi';
const CONTRACT_ADDRESS = '0x97F758Ef7A433AbCc4D2455bAC7F115e396a9273';
const CONTRACT_ABI = abi
const config = createConfig(
  getDefaultConfig({
    chains: [zkSyncSepoliaTestnet],
    transports: {
      [zkSyncSepoliaTestnet.id]: http(),
    },
    walletConnectProjectId: "dd13975ba8f862e48d36fccd385fb2ee",
    appName: "Your App Name",
  }),
);
// pipelining pending with vercel
// updates on zkchat done from deployement side
const queryClient = new QueryClient();

function UserCheck() {
  const { address, isConnected } = useAccount();
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [username, setUsername] = useState("");

  const { data: userExists } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'checkUserExists',
    args: address ? [address] : undefined,
  });


const {writeContract } = useWriteContract();

  useEffect(() => {
    if (isConnected && userExists === false) {
      setIsCreateUserModalOpen(true);
    }
  }, [isConnected, userExists]);

  const handleCreateUser = () => {
    if (username) {
      writeContract({ 
        abi,
        address: CONTRACT_ADDRESS,
        functionName: 'createAccount',
        args: [
          username
        ],
     })
      setIsCreateUserModalOpen(false);
    }
  };

  return (
    <>
    <h1>ZK Chat</h1>
      <Dialog open={isCreateUserModalOpen} onOpenChange={setIsCreateUserModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create User Account</DialogTitle>
            <DialogDescription>Please enter a username to create your account.</DialogDescription>
          </DialogHeader>
          <Input 
            placeholder="Username" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
          />
          <Button onClick={handleCreateUser} >
            Create Account
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function Home() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>
          <main className="flex h-[calc(100dvh)] flex-col items-center justify-center p-4 md:px-24 py-32 gap-4">
            <div className="flex justify-between max-w-5xl w-full items-center">
              <UserCheck />
            </div>
            <div className="z-10 border rounded-lg max-w-5xl w-full h-full text-sm lg:flex">
              <ChatLayout defaultLayout={undefined} navCollapsedSize={8} />
            </div>
          </main>
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
